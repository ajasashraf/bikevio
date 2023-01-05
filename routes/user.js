const {response}=require('express');
const express=require('express');
const router=express.Router();
const userHelper=require('../controller/helpers/userHelpers');
const userController=require('../controller/userController');
const {verifyOtp}=require('../controller/helpers/userHelpers')
const userSession=require('../middlewares/sessionController');
const sessionController = require('../middlewares/sessionController');

router.get('/',userController.homeView)
router.get('/login',userController.loginView)
router.get('/signup',userController.signupView)
router.get('/productdetails/:id',userController.productDetails)
router.get('/cart',sessionController.userSession,userController.cart)
router.get('/checkout',sessionController.userSession,userController.checkOut)
router.get('/product',userController.userProducts)
router.get('/brands/:id',userController.brandFilter)
router.get('/profile',sessionController.userSession,userController.userProfile)
router.get('/profilePage',sessionController.userSession,userController.profilePage)
router.get('/viewOrders',userController.viewOrders)
router.get('/orderSummary',userController.viewOrderDetails)
router.get('/cancelOrder',userController.cancelOrder)
router.get('/wishlist',sessionController.userSession,userController.wishlist);
router.get("/removeWishlist/:wishId", userController.removeWishlist);
router.get('/profile',sessionController.userSession,userController.userProfile)
router.get('/editProfile',sessionController.userSession,userController.editProfilePage)

router.post('/signup',userController.signUP)
router.post('/login',userController.logIN)
router.post('/verifyotp',userController.verifyOtp)
router.post('/resendotp',userController.resendOtp)
router.post('/logout',userController.logOut)
router.post('/add/cart',sessionController.userSession, userController.add_to_cart)
router.post('/remove/cart/:proId',sessionController.userSession,userController.remove_from_cart)
router.post('/newAddress',sessionController.userSession,userController.newAddress)
router.post('/applycoupon',userController.applyCoupon)
router.post('/orderbutton/:cartId',userController.orderbutton)
router.post("/addtoWishlist/:prodId", sessionController.userSession,userController.addtoWishlist);
router.post('/editProfile',sessionController.userSession,userController.editProfile)
router.post('/editUserPass',userController.resetPass)



module.exports=router;