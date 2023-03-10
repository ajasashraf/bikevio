const express = require("express");
const userHelper = require("./helpers/userHelpers");
const router = express.Router();
const productHelper = require("../controller/helpers/productHelper");
const category = require("../Model/categoryModel");
const product = require("../Model/productModel");
const coupon = require("../Model/coupon");
const { response } = require("express");
const orderModal = require("../Model/orderModel");
const userModel = require("../Model/userModel");

module.exports = {
  signinView: (req, res) => {
    if (req.session.adminLogged) {
      res.redirect("/admin/adminpanel");
    } else {
      res.render("admin/admin", { err: false });
    }
  },
  signIn:async(req, res) => {
    let currentDate = new Date();
    let today = currentDate.getDate();
    let month=currentDate.getMonth()
    let year=currentDate.getFullYear()
    let userTotal=await userModel.find()
    const admins = {
      email: "ajas@gmail.com",
      password: "1234",
    };
    if (
      req.body.email == admins.email &&
      req.body.password == admins.password
    ) {
      req.session.adminLogged = true;
      userHelper.viewUser().then(async(userList) => {
        let users = userList;
        const Todaysales = await orderModal.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  new Date().setHours(00, 00, 00)
                ),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ]);
        const MonthlySales = await orderModal.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  new Date(year,month,1).setHours(00, 00, 00)
                ),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ]);
        
        const TotalSales = await orderModal.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ]);
       
        res.render("admin/home",{MonthlySales,Todaysales,TotalSales,userTotal});
      });
    } else {
      res.render("admin/admin", { err: true });
    }
  },
  homeView:async (req, res) => {
    let currentDate = new Date();
    let today = currentDate.getDate();
    let month=currentDate.getMonth()
    let year=currentDate.getFullYear()
    let userTotal=await userModel.find()

    if (req.session.adminLogged) {

      const Todaysales = await orderModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date().setHours(00, 00, 00)
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);
  
      const MonthlySales = await orderModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date(year,month,1).setHours(00, 00, 00)
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

      const TotalSales = await orderModal.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

      res.render("admin/home",{MonthlySales,Todaysales,TotalSales,userTotal});
    } else {
      res.redirect("/admin");
    }
  },
  blockUser: (req, res) => {
    let userId = req.params.id;
    userHelper.blockUser(userId).then(() => {
      res.redirect("/admin/userview");
    });
  },
  unblockUser: (req, res) => {
    let userId = req.params.id;
    userHelper.unblockUser(userId).then(() => {
      res.redirect("/admin/userview");
    });
  },
  logOUt: (req, res) => {
    req.session.destroy();
    res.redirect("/admin");
  },
  userView: (req, res) => {
    if (req.session.adminLogged) {
      userHelper.viewUser().then((userList) => {
        let users = userList;
        res.render("admin/view-user", { users });
      });
    } else {
      res.redirect("/admin");
    }
  },
  categoryView: async (req, res) => {
    let categories = await category.find();
    res.render("admin/view-category", { categories });
  },
  addCategory: (req, res) => {
    productHelper.addCategory(req.body).then((response) => {
      if (response.status) {
        res.redirect("/admin/categoryview");
      } else {
        res.send("error");
      }
    });
  },
  deleteCategory: async (req, res) => {
    let id = req.params.id;
    await category.findByIdAndDelete({ _id: id });
    res.redirect("/admin/categoryview");
  },
  productView: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 5;
     const totalproducts = await product.find().countDocuments()
    let products = await product
      .find({})
      .populate("category", "name")
      .sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
    res.render("admin/view-product", { products, index: 1,page,
      hasNextPage: items_per_page * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1, });
  },
  addProductview: async (req, res) => {
    let categories = await category.find();
    res.render("admin/add-product", { categories });
  },
  addProduct: (req, res) => {
    productHelper.addProduct(req.body).then((response) => {
      if (response.status) {
        res.redirect("/admin/productview");
      } else {
        res.send("failed");
      }
    });
  },
  deleteProduct: async (req, res) => {
    let userId = req.params.id;
    await product.findByIdAndDelete({ _id: userId });
    res.redirect("/admin/productview");
  },
  editProductpage: async (req, res) => {
    let id = req.params.id;
    let products = await product
      .findById({ _id: id })
      .populate("category", "name");
    let categories = await category.find();
    res.render("admin/edit-product", { products, categories });
  },
  updateProduct: (req, res) => {
    let id = req.params.id;
    let data = req.body;
    productHelper.editProduct(id, data).then((response) => {
      if (response.status) {
        res.redirect("/admin/productview");
      } else {
        res.send("error in update");
      }
    });
  },
  couponView: async (req, res) => {
    let coupons = await coupon.find();
    if (coupons == null) {
      coupons = [];
    }
    res.render("admin/view-coupon", { coupons });
  },
  addCouponView: async (req, res) => {
    let coupons = await coupon.find();
    console.log(coupons);
    res.render("admin/add-coupon", { coupons });
  },
  addCoupon: (req, res) => {
    console.log(req.body, " .----------------------");
    productHelper.addCoupon(req.body).then((response) => {
      if (response.status) {
        res.redirect("/admin/couponView");
      } else {
        res.send("failed");
      }
    });
  },
  deleteCoupon: async (req, res) => {
    let userId = req.params.id;
    await coupon.findByIdAndDelete({ _id: userId });
    res.redirect("/admin/couponView");
  },
  adminOrder: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 10;
    const totalproducts = await product.find().countDocuments()
    const order = await orderModal.find().sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);;
    res.render("admin/view-order", { order, index: 1,page,
      hasNextPage: items_per_page * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1, });
    
  },
  changeTrack: async (req, res) => {
    try {
      oid = req.body.oid;
      value = req.body.value;

 
      
        await orderModal
          .updateOne(
            {
              _id: oid,
            },
            {
              $set: {
               
                orderStatus: value,
              
              },
            }
          )
          .then((res) => {
            res.json({ status: true });
          });
      
    } catch (error) {
      res.redirect('/admin')
    }
  },
  salesReport:async (req,res) =>{
    let orders=await orderModal.find({orderStatus:'Order confirmed'})
    res.render('admin/sales-report',{orders})
  }
};
