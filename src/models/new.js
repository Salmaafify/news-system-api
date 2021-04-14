const mongoose = require('mongoose')

//////////////////////////////////////////////////////////////////////////////////////////
const newschema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Reporter'
    }
},
{
    timestamps:true
}
)
const New =mongoose.model('New',newschema)
module.exports=New