const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const Objectid = mongoose.Types.ObjectId

const productSchema = new Schema({
    bikeName: String,
    category: {
        type: Objectid,
        ref: 'category' 
    },
    price: Number,
    description: String,
    imageUrl: Array
})

module.exports = Products = mongoose.model('Products', productSchema)