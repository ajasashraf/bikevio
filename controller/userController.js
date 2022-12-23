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
const { response } = require("express");

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
    let user = await userModel.findOne({ userId: userId });
    console.log(user.address,'useruser');
    //    let cartDetails=await cartModel.findOne({userId}).populate('products.productId')
    //    console.log(cartDetails,'cartDetailscartDetails');
    const cart = await cartModel
      .findOne({ userId })
      .populate("products.productId");
    console.log(cart?.products[0].productId, "hhhhhhhh");
    let bikeName = cart?.products[0].productId.bikeName;
    let price = cart?.products[0].productId.price;
    let description = cart?.products[0].productId.description;

    //     const cartDetails=await cartModel.find({userId:userId}).populate('products.productId').exec()
    //    const cartDetail= cartDetails[0]
    //    console.log(cartDetail);
    //    console.log(cartDetail._id,'cartDetaiddddddddddddddls');
  },
  productDetails: async (req, res) => {
    const productId = req.params.id;
    let loggedIn = req.session.loggedIn ? true : false;
    const products = await productModel.findOne({ _id: productId });
    res.render("user/product-details", { products, loggedIn });
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
    console.log(userId, "cartttttttttttttttttttttttttttttt");
    const cart = await cartModel
      .findOne({ userId })
      .populate("products.productId");
    if (cart) {
      let itemsInCart;
      let cart_total;
      let cartId;
      let coupon_applied = false;
      if (cart != null) {
        itemsInCart = cart.products;
        console.log(itemsInCart);

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
      });
    } else {
      res.render("user/cart", {
        loggedIn: true,
        itemsInCart: [],
        cart_total: 0,
        cartId: {},
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
    let loggedIn = req.session.loggedIn ? true : false;
    let brand = await categoryModel.find();
    let products = await productModel.find();
    res.render("user/products", { loggedIn, brand, products });
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
  userProfile: (req, res) => {
    let loggedIn = req.session.loggedIn;

    res.render("user/address", { loggedIn });
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

    res.render("user/checkout", {
      loggedIn,
      addresses: address.address,
      coupons,
      cartDetail,
    });
  },
  newAddress: async (req, res) => {
    const userId = req.session.userId;
    let userModel = await userModel.findById({ _id: userId });
    try {
      userModel.address.unshift({
        fullName: req.body.fullName,
        mobNumber: req.body.phoneNumber,
        homeaddress: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      });
      userModel.save().then(() => {
        res.redirect("/checkout");
      });
    } catch {
      res.redirect("/checkout");
    }
  },
  applyCoupon: (req, res) => {
    const userId = req.session.userId;
    const couponId = req.query.couponId;

    userHelper.applyCoupon(userId, couponId).then((response) => {
      response.exist ? res.json({ exist: true }) : res.json(response);
      console.log(response);
    });
  },

  orderbutton: async (req, res) => {
    console.log(req.body), "ajajajajaj";
    let cartId = req.params.cartId;

    console.log("ajjajjjja");
    const userId = req.session.userId;
    console.log(req.body, "body from checkout");

    let paymentMethod = req.body.paymentMethod;
    let user = await userModel.findOne({ userId: userId });
    const cart = await cartModel
      .findOne({ userId })
      .populate("products.productId");
    console.log(cart?.products[0].productId, "hhhhhhhh");
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
        orderStatus: "Order confirmed",
        totalAmount: price,
      });
      newOrder.save().then((res) => {
        console.log('response');
        console.log(res, "re");
      });

      console.log("paymentMethod==");
    }
  },
};
