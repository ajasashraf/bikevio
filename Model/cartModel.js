const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const cartSchema=new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId
    },
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:"Products"
            },
            price:{
                type:Number
            },
            date:{
                type:Date,
                default:Date.now()
            },
          
        }
    ],
    cartTotal:{
        type:Number,
    },
 
})

module.exports=cartModel=mongoose.model('cart',cartSchema)