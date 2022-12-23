const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String
    },email:{
        type:String
    },
    phone:{
        type:Number
    },
    password:{
        type:String
    },
    block:{
        type:Boolean
    },
    address:{
        type:Array
    }
})

module.exports=UserModel=mongoose.model('UserData',userSchema);