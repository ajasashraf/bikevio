const {response}=require('express');
const category=require('../../Model/categoryModel');
const product= require('../../Model/productModel');
const coupon=require('../../Model/coupon');
module.exports={
    addCategory:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let newCategory=await new category({
                name:data.name
            })
            newCategory.save()
            response.status=true
            resolve(response)
        })   
    },
    addProduct:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}

            let newProduct=await new product({
                bikeName:data.name,
                category:data.category,
                price:data.price,
                description:data.description,
                imageUrl:data.images  
            })
            newProduct.save()
            response.status=true
            resolve(response)
        })
    },
    editProduct:(id,data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let updatedData;
            if(data.images == ''){
                updatedData =await product.findOneAndUpdate({_id:id},{$set:{bikeName:data.name,category:data.category,price:data.price,description:data.description}})
            }else{
                updatedData =await product.findOneAndUpdate({_id:id},{$set:{bikeName:data.name,category:data.category,price:data.price,description:data.description,imageUrl:data.images}})
            }
                await updatedData.save()
                response.status=true
                resolve(response) 
        })
    },
    addCoupon:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            console.log("data"+data.name)
            let newCoupon= new coupon({
                name:data.name,
                discount:data.discount,
            })
            await newCoupon.save()
            response.status=true
            resolve(response)
        })
    },
    
}