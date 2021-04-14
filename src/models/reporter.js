const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const reporterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    address:{
        type: String,
        // required: true,
        default: null,
        trim:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    },
},
{
    timestamps:true
}
)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//relation with news
reporterSchema.virtual('news',{
    ref:'New',
    localField:'_id',
    foreignField:'owner'
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
reporterSchema.statics.findByCredentials = async(email,password)=>{
    const reporter = await  Reporter.findOne({email})
    if(!reporter){
        throw new Error('Unable To Login')
    }
    const isMatch = await bcrypt.compare(password,reporter.password)

    if(!isMatch){
        throw new Error('Unable To Login')
    }
    return reporter
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//hash password
reporterSchema.pre('save',async function(next){
    const reporter =this
    if(reporter.isModified('password')){
        reporter.password = await bcrypt.hash(reporter.password,8)
    }
    next()
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//generate tokens
reporterSchema.methods.generateToken = async function(){
    const reporter = this
    const token = jwt.sign({_id:reporter._id.toString()},'node course')
    reporter.tokens = reporter.tokens.concat({token:token})

    await reporter.save()
    return token
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// hide some info
reporterSchema.methods.toJson = function(){
    const reporter = this
    const reporterObject = reporter.toObject()
    delete reporterObject.password
    delete reporterObject.tokens

    return reporterObject
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Reporter =mongoose.model('Reporter',reporterSchema)
module.exports = Reporter