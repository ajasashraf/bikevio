const express=require('express');
const router=express.Router();
const adminController=require('../controller/adminController');
const userController=require('../controller/userController');
const sessionControl=require('../middlewares/sessionController');
const productHelper=require('../controller/helpers/productHelper')
const fileUplod = require('../middlewares/multer')
const {response} =require('express')

//get
router.get('/',adminController.signinView)
router.get('/adminpanel',adminController.homeView)
router.get('/userview',adminController.userView)
router.get('/categoryview',sessionControl.adminSession,adminController.categoryView)
router.get('/productview',sessionControl.adminSession,adminController.productView)
router.get('/addproduct',sessionControl.adminSession,adminController.addProductview)
router.get('/editproduct/:id',sessionControl.adminSession,adminController.editProductpage)
router.get('/couponView',sessionControl.adminSession,adminController. couponView)
router.get('/addcoupon',sessionControl.adminSession,adminController.addCouponView)
router.get('/salesreport',sessionControl.adminSession,adminController.salesReport)
//post
router.post('/login',adminController.signIn)
router.post('/adminpanel/block/:id',adminController.blockUser)
router.post('/adminpanel/unblock/:id',adminController.unblockUser)
router.post('/logout',adminController.logOUt)
router.post('/categoryview',adminController.addCategory)
router.post('/deletecategory/:id',adminController.deleteCategory)
router.post('/addproduct',fileUplod.uploadImages,fileUplod.resizeImages,adminController.addProduct)
router.post('/deleteproduct/:id',adminController.deleteProduct)
router.post('/editproduct/:id',fileUplod.uploadImages,fileUplod.resizeImages,adminController.updateProduct)
router.post('/addcoupon',adminController.addCoupon)
router.post('/deletecoupon/:id',adminController.deleteCoupon)
// 
router.post("/order-status", adminController.changeTrack);
router.get('/admin-orders',adminController.adminOrder)
module.exports=router;