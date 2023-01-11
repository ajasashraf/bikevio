const express = require("express");
const userHelpers = require("./helpers/userHelpers");
const router = express.Router();
const userHelper = require("./helpers/userHelpers");
const productModel = require("../Model/productModel");
const cartModel = require("../Model/cartModel");
const categoryModel = require("../Model/categoryModel");
const userModel = require("../Model/userModel");
const user = require("../middlewares/sessionController");
const couponModel = require("../Model/coupon");
const orderModel = require("../Model/orderModel");
const wishlistModel=require("../Model/wishlistModel");
const Razorpay=require('razorpay');
const { response } = require("express");
const { default: mongoose } = require("mongoose");
var instance = new Razorpay({
  key_id:'rzp_test_uizcWUjK0kfQb4',
  key_secret:'OOzYSdhYk53vstYLMn0yxucF',
})
const {
  validatePaymentVerification,
} = require('../node_modules/razorpay/dist/utils/razorpay-utils');

module.exports = {
  signUP: (req, res) => {
    userHelper.doSignup(req.body).then((response) => {
      if (response.pass) {
        if (response.status) {
          res.render("user/otp", { otperr: false });
        } else {
          let err = true;
          res.render("user/signup", { err, pass: false });
        }
      } else {
        let pass = true;
        res.render("user/signup", { pass, err: false });
      }
    });
  },
  loginView: (req, res) => {
    if (req.session.loggedIn) {
      let loggedIn = req.session.loggedIn;
      res.redirect("/");
    } else {
      res.render("user/login", { err: false, blocked: false });
    }
  },
  signupView: (req, res) => {
    res.render("user/signup", { err: false, pass: false });
  },
  logIN: (req, res) => {
    userHelper.doLogin(req.body).then((response) => {
      if (response.logged) {
        req.session.userId = response.user._id;
        req.session.loggedIn = true;
        req.session.logError = false;
        let loggedIn = req.session.loggedIn;

        res.redirect("/");
      } else if (response.blocked) {
        res.render("user/login", { blocked: true, err: false });
      } else {
        req.session.loggedIn = false;
        req.session.logError = true;
        res.render("user/login", { err: true, blocked: false });
      }
    });
  },
  verifyOtp: (req, res) => {
    console.log(req.body.otp);
    userHelper.verifyOtp(req.body).then((response) => {
      if (response.status) {
        res.redirect("/login");
      } else {
        res.render("user/otp", { otperr: true });
      }
    });
  },
  resendOtp: (req, res) => {
    userHelper.resendOtp(req.body);
    res.render("user/otp", { otperr: false });
  },
  logOut: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
  homeView: async (req, res) => {
    let loggedIn = req.session.loggedIn;
    const userId = req.session.userId;
    let products = await productModel.find().limit(4);
    
    res.render("user/user", { loggedIn, products });



  },
  productDetails: async (req, res) => {
    const user=req.session.userId
    const productId = req.params.id;
    let loggedIn = req.session.loggedIn ? true : false;
    const products = await productModel.findOne({ _id: productId });
    res.render("user/product-details", { products, loggedIn, user });
  },
  add_to_cart: async (req, res) => {
    const productId = req.body.productId.trim();
    const userId = req.session.userId;
    console.log(productId);
    const cartExist = await cartModel.findOne({ userId });
    const product = await productModel.findOne({ _id: productId });
    console.log(product, "productproduct");
    const price = product.price;
    if (cartExist) {
      let prodExistInCart = await cartModel.findOne({
        userId,
        "products.productId": productId,
      });
      console.log(prodExistInCart, "productss");
      if (prodExistInCart === null) {
        console.log("--------------It's not in cart");
        await cartModel.findOneAndUpdate(
          { userId },
          {
            $addToSet: { products: { productId } },
            $inc: { cartTotal: price },
          }
        );

        let cart = await cartModel({});
        res.json({ status: true });
      } else {
        res.json({ exist: true });
      }
    } else {
      const new_cart = new cartModel({
        userId,
        products: [{ productId }],
        cartTotal: price,
      });
      await new_cart.save();
      console.log("2");
      res.json({ status: true });
    }
  },
  cart: async (req, res) => {
    const userId = req.session.userId;
    const cart = await cartModel
      .findOne({ userId })
      .populate("products.productId");
     
 
    if (cart) {
      let cartlen= cart.products.length
      let itemsInCart;
      let cart_total;
      let cartId;
      if (cart != null) {
        itemsInCart = cart.products;
        cartId = cart._id;
        cart_total = cart.cartTotal;
        coupon_applied = true;
        if (cart_total === 0) {
          cart_total = cart.cartTotal;
        }
      }
      res.render("user/cart", {
        loggedIn: true,
        itemsInCart,
        cart_total,
        cartId,
        cartlen
      });
    } else {
      
      console.log('dgksajdgkjanskjfg');
      res.render("user/cart", {
        loggedIn: true,
        itemsInCart: [],
        cart_total: 0,
        cartId: {},
        cartlen:0
      });
    }
  },
  remove_from_cart: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.proId;
    const cart = await cartModel.findOne({ userId });
    let cart_total;
    if (cart != null) {
      cart_total = cart.cartTotal;
    }
    const product = await productModel.findOne({ _id: productId });
    const product_price = product.price;
    const totalPrice = cart_total - product_price;
    const final_total = Math.abs(totalPrice);
    await cartModel.updateOne(
      { userId },
      { $set: { cartTotal: final_total, grandTotal: 0 } }
    );
    await cartModel
      .updateOne({ userId }, { $pull: { products: { productId } } })
      .then(() => res.json({ status: true }));
  },
  userProducts: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 8;
     const totalproducts = await productModel.find().countDocuments()
    let loggedIn = req.session.loggedIn ? true : false;
    let brand = await categoryModel.find();
    let products = await productModel.find().sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
    res.render("user/products", { loggedIn, brand, products,page,
      hasNextPage: items_per_page * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1, });
  },
  brandFilter: async (req, res) => {
    let loggedIn = req.session.loggedIn;
    let products = await productModel.find();
    let brand = await categoryModel.find();

    let id = req.params.id;

    let brandFilter = await productModel
      .find({ category: id })
      .populate("category");

    console.log("brandFilter" + brandFilter);

    if (brandFilter) {
      res.render("user/brandview", { loggedIn, brandFilter, brand, products });
    } else {
      res.redirect("/user");
    }
  },
  checkOut: async (req, res) => {
    let loggedIn = req.session.loggedIn ? true : false;
    const userId = req.session.userId;
    let address = await userModel.findById({ _id: userId });
    let coupons = await couponModel.find();

    const cartDetails = await cartModel
      .find({ userId: userId })
      .populate("products.productId")
      .exec();
    const cartDetail = cartDetails[0];
  
   let bookingAmount=address.bookingAmount
 console.log(bookingAmount,'bookingAmountbookingAmount');
    let applayCoupon= address.applyCoupon
    const usedCouponlen = address.usedCoupon.length -1
      const usedCoupon = address.usedCoupon[usedCouponlen]
     
    res.render("user/checkout", {
      loggedIn,
      addresses: address.address,
      coupons,
      cartDetail,
      applayCoupon,
      bookingAmount,
      usedCoupon
    });
  },
  newAddress: async (req, res) => {
   

    const userId = req.session.userId;
   
    let user = await userModel.findById({ _id: userId });
    console.log(user,'useruser');
    try {
      user.address.unshift({
        fullName: req.body.fullName,
        mobNumber: req.body.phoneNumber,
        homeaddress: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      });
      user.save().then(() => {
        res.redirect("/checkout");
      });
    } catch {
      res.redirect("/checkout");
    }
  },
  applyCoupon:async  (req, res) => {
    try {
      let userId = req.session.userId
      const user = await userModel.findById(userId)
      const CouponCode = req.body.coupon
      const amountTotal=req.body.amountTotal
      let total = parseInt(amountTotal)
      let coupon = await couponModel.findOne({ name: CouponCode })
      let date = new Date()

      if (user.applyCoupon) {
          await userModel.updateOne({_id:userId} ,{
                  $set:{
                      applyCoupon:false
                  }
              })
          await userModel.updateOne({_id:userId} ,{
                  $pull:{
                      usedCoupon:{
                          couponId:coupon._id,
                          code:coupon.couponCode,
                      }
                  }
              })
                await userModel.updateOne({_id:userId} ,{
                            $set:{
                              bookingAmount:10000
                            }
                    })
              res.json({removeCoupon:true})
      } else {
          if(CouponCode == ''){
              res.json(false)
          }else{
            console.log(coupon._id,'id');
              const existCoupon = await userModel.findOne({_id:userId,'usedCoupon.couponId':coupon._id})
          console.log(existCoupon,"exist");
          if (existCoupon) {
              res.json({exist:true})
          } else {
              if (coupon) {
              let percentage = coupon.discount
              console.log(coupon.expiryDate);
              if (coupon.startDate <= date <= coupon.expiryDate) {
                  console.log(total);
               
                      discount = (total * percentage) / 100
                      console.log(discount,'discountdiscountdiscountdiscount');
                          let totalLast = total - discount
                          console.log(totalLast,'totalLasttotalLasttotalLast');
                          await cartModel.updateMany(
                            {userId:userId},
                            {
                              $set: {
                                couponDiscount:discount,
                                
  
                              }
                            }
                          )
                          await userModel.updateOne({_id:userId} ,{
                            $set:{
                              bookingAmount:totalLast
                            }
                    })
                          await userModel.updateOne({_id:userId} ,{
                                  $set:{
                                      applyCoupon:true
                                  }
                          })
                          console.log('Hii');
                          await userModel.updateOne({_id:userId} ,{
                              $push:{
                                  usedCoupon:{
                                      couponId:coupon._id,
                                      code:coupon.name,
                                      couponUsed:date,
                                  }
                              }
                          })
                          console.log('Hii');
                          res.json({ success: true })
                    
                  
              } else {
                  res.json({ expired: true })
              }
          } else {
              res.json({ invalid: true })
          }
          }
          }
      }
  } catch (error) {
      console.log(error.message);
  }
  },

  orderbutton: async (req, res) => {
    console.log(req.body,'ajasa');
    let cartId = req.params.cartId;
    let loggedIn = req.session.loggedIn;
    
    const userId = req.session.userId;
    console.log(req.body, "body from checkout");

    let paymentMethod = req.body.paymentMethod;



    let user = await userModel.findOne({ _id: userId });
    console.log(user,'useruseruseruseruseruseruseruseruseruseruser');
    var bookingAmount=user.bookingAmount;
    var bookingAmount=parseInt(bookingAmount)
    console.log(bookingAmount,'bookingAmountbookingAmountbookingAmountbookingAmountbookingAmount');
    const cart = await cartModel
      .findOne({ userId })
      .populate("products.productId");
    let vehicleId = cart?.products[0].productId._id;
    let bikeName = cart?.products[0].productId.bikeName;
    var price = cart?.products[0].productId.price;
    var price =parseInt(price)
    let description = cart?.products[0].productId.description;
    let userAddress = user.address;
    console.log(userAddress,'userAddress');

    //   let address=
    if (paymentMethod == "COD") {
        console.log('ajajj');
      const newOrder = new orderModel({
        userId: userId,
        Address: userAddress,
        vehicles: [{ vehicleId, bikeName, price, description }],
        paymentMethod: "cash on delivery",
        paymentStatus: "Payment pending",
        orderStatus: "Waiting For Confirmation",
        totalAmount: price,
      });
      newOrder.save().then((re) => {
        console.log('response');

        console.log(re, "re");
        cartModel.findOneAndRemove({userId:userId}).then((re)=>{
          console.log(re,'ajajajaj');
        res.json({cashOnDelivery:true})

        })
      });

      // cartModel.findOneAndRemove({userId:userId}).then((re)=>{
      //   console.log(re,'ajajajaj');
        // res.render('user/orderSuccess',{loggedIn});

      // })

      console.log("paymentMethod==");
    }
    else if (paymentMethod == "Razorpay") {
      const newOrder = new orderModel({
          userId: userId,
          Address: userAddress,
          vehicles: [{ vehicleId, bikeName, price, description }],
          paymentMethod: "Razorpay",
          paymentStatus: "Payment pending",
          orderStatus: "Order confirmed",
          totalAmount: price,
        
      });
      await cart.remove();
      newOrder.save().then((result) => {
        let userOrderData = result;
        console.log(result, "result");
        let orderId = result._id.toString();

        instance.orders.create(
          {
            amount: bookingAmount*100,
            currency: "INR",
            receipt: orderId,
            notes: {
              key1: "value1",
              key2: "value2",
            },
          },
          (err, order) => {
            let response = {
              onlinePayment: true,
              razorpayOrderData: order,
              userOrderData: userOrderData,
              bookingAmount:bookingAmount
            };
            res.json(response);
          }
        );
      });
    }
    else{
      var options = {
        amount: 10000 , // amount in the smallest currency unit
        currency: "INR",
        receipt: "ajas",
    };
    instance.orders.create(options, function (err, order) {
      
        res.json({ order, userOrder, User });
    });
    }
  },
  profilePage:async(req,res)=>{
    let loggedIn = req.session.loggedIn;
    let userId=req.session.userId
    let userDetails =await userModel.findOne({_id:userId})
    let userName=userDetails.name.toUpperCase()
    res.render('user/profile',{loggedIn,userName})
  },
  doVerifyPayment:async(req,res)=>{
    let razorpayOrderDataId = req.body['payment[razorpay_order_id]'];
let userId=req.session.userId
    let paymentId = req.body['payment[razorpay_payment_id]'];

    let paymentSignature = req.body['payment[razorpay_signature]'];

    let userOrderDataId = req.body['userOrderData[_id]'];

    validate = validatePaymentVerification(
      { order_id: razorpayOrderDataId, payment_id: paymentId },
      paymentSignature,
      'OOzYSdhYk53vstYLMn0yxucF'
    );
let user = await userModel.findOne({_id:userId})
console.log(user,'userrrrr');
    if (validate) {
      let order = await orderModel.findById(userOrderDataId);
      orderStatus = 'Order Placed';
      paymentStatus = 'Payment Completed';
      order.save().then((result) => {
        res.json({ status: true });
      });
      console.log(user.applyCoupon,'user.applyCouponuser.applyCouponuser.applyCouponuser.applyCoupon');
    if(user.applyCoupon){
      await userModel.findByIdAndUpdate(userId,{applyCoupon:false,bookingAmount:10000})
      // findByIdAndUpdate(id,{orderStatus:"cancelled"})
    }
    }
   
  },


  viewOrders: async (req, res) => {
    try {
      let loggedIn = req.session.loggedIn;
  
          
          let result = await orderModel
            .find({ userId: req.session.userId })
            .sort({ createdAt: -1 });
          console.log(result, "resultresultresult");
          // let result =await orderModel.find()
          res.render("user/view-orders", {
            loggedIn,
            Orders: result,
          });
        } catch (err) {
          res.use((req, res) => {
            res.status(429).render("admin/error-429");
          });
        }

  },

  viewOrderDetails:async(req,res)=>{
    let loggedIn = req.session.loggedIn;
    let id =req.query.id;
    let order=await orderModel.findById(id)
    res.render('user/orderSummery',{loggedIn,id:order})
    
    // const order=await orderModel,find()
  },
  cancelOrder:async(req,res)=>{
    let id=req.query.id
    console.log(id,'ididv');
    let order=await orderModel.findByIdAndUpdate(id,{orderStatus:"cancelled"}).then((re)=>{
      console.log(re,'kkkkk');
    })
  }, 
  addtoWishlist: async (req, res) => {
    try {
      let userId = req.session.userId;
      console.log(userId,'userIduserIduserId');
      console.log(req.body,'bodyyyyyyyyyyyyyyyyyyyyys q');
      let name = req.body.name;
      let ProductId = req.params.prodId;
      console.log(ProductId);
      let list = await wishlistModel.findOne({ userId: userId });
      
      if (list) {
        let itemIndex = list.myWishlist.findIndex(
          (p) => p.ProductId == ProductId
        );
        console.log(itemIndex+'opopopopopoppo');
        if (itemIndex < 0) {
          list.myWishlist.push({ ProductId, name });
          await list.save();
        res.json({status:true})
        } else {
          list.myWishlist.splice(itemIndex, 1);
          res.json({exist:true})
        }
        
      } else {

        list = new wishlistModel({
          userId: userId,
          myWishlist: [{ ProductId, name }],
        });
        await list.save();
        res.json({status:true})
        res.redirect("/");

        console.log("wishlist first added");
      }
    } catch (error) {
      console.log(error.message, "error from wishlist");
    }
  },
  wishlist: async (req, res) => {
    let loggedIn = req.session.loggedIn;

    try {
      let userId = req.session.userId;
      console.log(userId,'userIduserIduserId');
      const wishView = await wishlistModel
        .findOne({ userId })
        .populate("myWishlist.ProductId")
        .exec();
        let wishlen=wishView.myWishlist.length
      if (wishView) {
        req.session.wishNum = wishView.myWishlist.length;
      }
      wishNum = req.session.wishNum;
      console.log(wishView, "wishView");

      cartNum = req.session.cartNum;
      res.render("user/wishlist", {
        loggedIn,
        wishNum,
        wishProducts: wishView,
        wishlen,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  removeWishlist: async (req, res) => {
    let userWishlist = await wishlistModel.findOne({
      userId: req.session.userId,
    });
    let wishlistIndex = userWishlist.myWishlist.findIndex(
      (prod) => (prod._id = req.params.wishId)
    );
    if (wishlistIndex != null) {
      userWishlist.myWishlist.splice(wishlistIndex, 1);
      await userWishlist.save();
      res.redirect("/wishlist");
    } else {
      res.redirect("/");
    }
  },
  userProfile:async(req,res)=>{
    let loggedIn = req.session.loggedIn;
    let userId=req.session.userId
    let userDetails =await userModel.findOne({_id:userId})
    let userName=userDetails.name.toUpperCase()
    res.render('user/user-profile',{userDetails,userName,loggedIn})
},
editProfilePage:async(req,res)=>{
  let loggedIn = req.session.loggedIn;
  let userId = req.session.userId
  let userDetails = await userModel.findOne({_id:userId})
  res.render('user/edit-profile',{userDetails,err:false,success:false,loggedIn})
},
editProfile:(req,res)=>{
  let data = req.body
  let userId=req.session.userId
  
  userHelpers.editUser(data,userId).then(()=>{
      res.redirect('/editProfile')
  })
},
resetPass:(req,res)=>{
  let loggedIn = req.session.loggedIn;
  let userId= req.session.userId
  let data=req.body
  userHelpers.resetPass(userId,data).then(async(response)=>{
   let userDetails = await userModel.findOne({_id:userId})
       if(response.status){
           res.render('user/edit-profile',{err:false,success:true,userDetails,loggedIn})
       }else{
           res.render('user/edit-profile',{err:true,success:false,userDetails,loggedIn})
       }
  })
 },
 search:async (req,res)=>{
  const searchQuery = req.body.search
  console.log(searchQuery);
  // const searchString = ''+searchQuery
  // console.log(searchString);
  const search = await productModel.find({bikeName:{ $regex: searchQuery, '$options' : 'i' }})
  console.log(search,"searchhhhhhhhhh");
  const category=await categoryModel.find()

  console.log(search);
  const searchlen = search.length
    if(req.session.loggedIn){
      res.render('user/search',{loggedIn: true, user: req.session.user, search, category, searchQuery,searchlen })
    }else{
      res.render('user/search',{loggedIn: false, user: req.session.user, search, category,searchQuery,searchlen })
    }
  
 


},
}
