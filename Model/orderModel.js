const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const objectId=mongoose.Types.ObjectId


const orderSchema=new Schema({
    Address:{
        type:Object,
    },
    userId:{
        type:String,
        required:true
    },
    vehicles:[
       {
        vehicleId:{
          type:objectId,
          ref:"Products"
        },
        bikeName:String,
        price:Number,
        description:String

       }


      ],
    paymentMethod : {
        type: String,
        required: true,
        trim: true
      },
    paymentStatus : {
        type: String,
        required: true,
        trim: true
      },
    orderStatus : {
        type: String,
        required: true,
        trim: true
      },
      
    totalProduct : {
        type: Number,
        trim: true
      },
    totalAmount : {
        type: Number,
        required: true,
        trim: true
      },
     
    deliveryDate : {
      type: String,
      trim: true
      },

},{timestamps:true})
module.exports=coupon=mongoose.model("order", orderSchema);