const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        
    }
})

module.exports=category=mongoose.model('category',categorySchema)