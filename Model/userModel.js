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
    },
    usedCoupon:{
        type:Array
    },
    bookingAmount:{
        type:Number,
        default:10000
      },
    applyCoupon:{
        type:Boolean,
        default:false
    }
})

module.exports=UserModel=mongoose.model('UserData',userSchema);