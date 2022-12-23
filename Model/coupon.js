const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const couponSchema=new Schema({
    name:{
        type:String,
    },
    discount:{
        type:Number,
    },
    users:{
        type:[Schema.Types.ObjectId],
    },
    disable:{
        type:Boolean,
        default:false,
    },
    created_date:Date,
    modified_date:Date,
})
module.exports=coupon=mongoose.model("coupon", couponSchema);