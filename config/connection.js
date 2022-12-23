const mongoose=require('mongoose');

module.exports.connect=function(){
    mongoose.connect('mongodb://localhost:27017/Bikevio',()=>console.log('Connected to database'));
}