const express = require('express')
const reporterRouter = require('./routers/reporters')
const newRouter = require('./routers/news')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const New = require('./models/new')
const Reporter = require('./models/reporter')
const multer = require('multer')
require('./db/mongoose')
//////////////////////////////////////////////////////////////////////////////////////////////
const port = 3000
const app = express()
app.use(express.json())
//////////////////////////////////////////////////////////////////////////////////////////
app.use(reporterRouter)
app.use(newRouter)
////////////////////////////////////////////////////////////////////////////////////////////
const main = async()=>{
    const reporter = await Reporter.findById(' ')
    await user.populate('news').execPopulate()
    console.log(reporter.news)
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
const uploads = multer({
    dest:'images',
    limits:{
        fileSize:1000000              
    },
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith('.pdf')){
            cb(new Error('Please upload pdf file'))
        }
        cb(undefined,true)
    }
})

app.post('/uploads', uploads.single('image'),(req,res)=>{
    res.send()
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(port,()=>{
    console.log('Server is running')
})

