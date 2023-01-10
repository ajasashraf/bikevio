const mongoose=require('mongoose');

module.exports.connect=function(){
    mongoose.connect('mongodb+srv://Bikevio:1234@cluster0.vxhj7hj.mongodb.net/cluster0?retryWrites=true&w=majority',()=>console.log('Connected to database'));
}