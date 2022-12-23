const db = require('mongoose');
const user = require('../../Model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const couponModel = require('../../Model/coupon');
const cartModel = require('../../Model/cartModel');

//OTP
var Name
var Email
var Phone
var Password
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: 'bikevioo@gmail.com',
        pass: 'cewkzyoecuxyhlba',
    }

});

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

module.exports = {
    //signup-------
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}

            if (userData.password == userData.repassword) {
                userData.password = await bcrypt.hash(userData.password, 10)
                Name = userData.name
                Email = userData.email
                Phone = userData.phone
                Password = userData.password
                response.pass = true
                user.findOne({ email: userData.email }, (err, data) => {
                    if (!data) {

                        var mailOptions = {
                            to: userData.email,
                            subject: "Otp for registration is: ",
                            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                        }
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                            }
                            console.log("msg sent");
                        })
                        response.status = true;
                        resolve(response)

                    } else {
                        response.status = false
                        resolve(response)
                    }
                })
            } else {
                resolve({ pass: false })
            }

        })
    },
    verifyOtp: (userData) => {
        console.log('verifyotp');
        return new Promise((resolve, reject) => {
            let response = {}
            if (userData.otp == otp) {
                let newUser = new user({
                    name: Name,
                    email: Email,
                    phone: Phone,
                    password: Password,
                    block: false
                })
                newUser.save()
                response.status = true
                resolve(response)
            } else {
                response.status = false
                resolve(response)
            }
        })
    },
    resendOtp: () => {
        mailOptions = {
            to: Email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log("msg sent");
        })
    },
    //Login---------
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            if (userData.email || userData.password) {
                let userLogged = await user.findOne({ email: userData.email })
                if (userLogged) {
                    // console.log(userLogged.block);
                    if (userLogged.block) {
                        response.blocked = true
                        resolve(response)
                    } else {
                        if (userLogged) {
                            bcrypt.compare(userData.password, userLogged.password).then((status) => {
                                if (status) {

                                    response.logged = true
                                    response.user = userLogged
                                    resolve(response)
                                } else {
                                    response.logged = false
                                    response.passerr = true
                                    resolve(response)
                                }
                            })
                        } else {
                            response.logged = false
                            response.emailerr = true
                            resolve(response)
                        }
                    }

                } else {
                    response.logged = false
                    response.passerr = true
                    resolve(response)
                }
            }
        })
    },
    viewUser: () => {
        return new Promise(async (resolve, reject) => {
            let userList = await user.find()
            resolve(userList)

        })
    },
    blockUser: async (userId) => {
        await user.updateOne({ _id: userId }, { $set: { block: true } })
    },
    unblockUser: async (userId) => {
        await user.updateOne({ _id: userId }, { $set: { block: false } })
    },
    applyCoupon: (userId, couponId) => {
        return new Promise(async (resolve, reject) => {
            
            console.log(userId,'userId');

            let coupon=await couponModel.findOne({_id:couponId})
            let exist = await couponModel.findOne({ _id: couponId, users: { $in: userId } })
            if (exist) {
                resolve({ exist: true })
            } else {
                let amount = ((10000 / 100) * coupon.discount).toFixed(0)
                let grandTotal = 10000 - amount
                console.log(grandTotal)
              
                resolve({ grandTotal, amount })
            }

        })
    }
}