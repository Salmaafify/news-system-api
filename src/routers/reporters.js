const express = require('express')
const router = new express.Router()
const Reporter = require('../models/reporter')
const auth = require('../middleware/auth')
const multer = require('multer')

/////////////////////////////////////////////////////////////////////////////////
router.post('/reporters',async(req,res)=>{
    const reporter = new Reporter(req.body)
     try{
         await reporter.save()
         const token = await reporter.generateToken()
         res.status(201).send({reporter,token})
     }
     catch(e){
         res.status(400).send(e)
     }
})
///////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/reporters/login',async(req,res)=>{
    try{
        const reporter = await Reporter.findByCredentials(req.body.email,req.body.password)
        const token = await reporter.generateToken()

        res.send({reporter,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//get all 
router.get('/reporters',auth,(req,res)=>{
    Reporter.find({}).then((reporters)=>{
        res.status(200).send(reporters)
    }).catch((e)=>{
        res.status(500).send(e)
    })

})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//get by id
router.get('/reporters/:id',(req,res)=>{
    const _id = req.params.id
    Reporter.findById(_id).then((reporter)=>{
        if(!reporter){
            return res.status(404).send('This Reporter Is Not Found')
        }
        res.status(200).send(reporter)
    })
    .catch((e)=>{
        res.status(500).send('Connection Error')
    })
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//update
router.patch('/reporters/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)

    const allowedUpdates = ['name','password']
    var isValid = updates.every((element)=> allowedUpdates.includes(element))
    if(!isValid){
        return res.status(400).send('Can Not Update')
    }

    const _id = req.params.id
    try{
        const reporter = await Reporter.findById(_id)
        updates.forEach((update)=>(reporter[update] = req.body[update]))
        await reporter.save()

        if(!reporter){
            return res.send('No Reporter Is Found')
        }
        res.status(200).send(reporter)
    }
    catch(e){
        res.status(400).send('Error' + e)
    }

})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.delete('/reporters/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const reporter = await Reporter.findByIdAndDelete(_id)
        if(!reporter){
            return res.send('No Reporter Is Found')
        }
        res.status(200).send(reporter)
    }
    catch(e){
        res.status(400).send('Error' + e)
    }
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/reporters/logout',auth,async(req,res)=>{
    try{
        req.reporter.tokens = req.reporter.tokens.filter((element)=>{
            return element.token !== req.token
        })
        await req.reporter.save()
        res.send('Logout Done Successfully')
    }
    catch(e){
        res.status(400).send('Please Try Login Again')
    }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/reporters/logoutall',auth,async(req,res)=>{
    try{
        req.reporter.tokens = []
        await req.reporter.save()
        res.send('Logout Done Successfully')
    }
    catch(e){
        res.status(400).send('Please Try Login Again')
    }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//profile
router.get('/profile',auth,async(req,res)=>{
    res.send(req.reporter)
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.patch('/profile',auth,async(req,res)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','password']

    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if(!isValid){
        return res.status(400).send('cannot update')
    }

    try{
        updates.forEach((update)=> (req.reporter[update] = req.body[update]))
        await req.reporter.save()
        res.status(200).send(req.reporter)
    }
    catch(e){
        res.status(400).send(e)
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.delete('/profile',auth,async(req,res)=>{
    try{
      await req.reporter.remove()
      res.send('Deleted')
    }
    catch(e){
        res.send(e)
    }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const uploads = multer({
    limits:{
        fileSize:1000000
    },
   fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
   }

})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/profile/avatar',auth,uploads.single('avatar'),async(req,res)=>{
    try{
        req.reporter.avatar = req.file.buffer
        await req.reporter.save()
        res.send()
    }catch(e){
        res.send(e)
    }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router
