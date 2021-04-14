const express = require('express')
const router = new express.Router()
const New = require('../models/new')
const auth = require('../middleware/auth')
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/news',auth,async(req,res)=>{
    const neew = new New({...req.body,owner:req.reporter._id})
    try{
        await neew.save()
        res.status(200).send(neew)
    }
    catch(e){
        res.status(400).send(e)
    }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/news',auth,async(req,res)=>{
    try{
        const match = {}
        if(req.query.completed){
            match.completed = req.query.completed === 'true' 
        }
        ////////////////////////
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc'? -1 : 1
        }
        await req.reporter.populate({
            path:'news',
            match:match,
            option:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e)
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/news/:id',async(req,res)=>{
    const _id = req.params.id
    try{
        const neew = await New.findOne({_id,owner:req.reporter._id})
        if(!neew){
            return res.status(400).send('No New Exist Here')
        }
        res.status(200).send(neew)
    }
    catch(e){
        res.status(500).send(e)
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.patch('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    try{
        const neew = await New.findOne({_id,owner:req.reporter._id})
        if(!neew){
            return res.status(404).send('Now New Is Found To Update')
        }
        updates.forEach((update) => neew[update]= req.body[update])

        await neew.save()
        res.send(neew)
    }catch(e){
        res.send(e)
    }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.delete('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const neew = await New.findOneAndDelete({_id,owner:req.reporter._id})
        if(!neew){
            return res.status(400).send('Now New Is Found To Delete')
        }
        res.send('Deleted')
    }
    catch(e){
        res.status(500).send(e)
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router