var express = require('express');
var router = express.Router();
const OTPGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const userbase = require('../database/user_base');
const session = require('express-session');
const { LogContextImpl } = require('twilio/lib/rest/serverless/v1/service/environment/log');
const objectId = require('mongodb').ObjectId
const qrcode = require('../public/javascripts/qrcode');
const { parseConnectionString } = require('mongodb/lib/core');

const verfyUserLogin = (req, res, next) => {
  if (req.session.status) {
    next()
  }
  else {
    res.redirect('/login')
  }
}
/* GET users listing. */
var signupstate =
{
  user: null,
  ph: null,
  email: null,
  password: null,
  otp: null,

}
var Globalqut = false
var successcut = false

router.get('/', function (req, res, next) {
  if (req.session.status) {
    userbase.Get_Cart_Count(req.session.user._id).then((count) => {
      userbase.Admin_Message(req.session.user._id).then((msg)=>{
      userbase.Get_Products({ type: "Heavy_food" }).then((pro) => {
        var pro1 = pro[0]
        // pro.shift()
        //console.log(pro);
        userbase.Get_Products({ type: "Snacks" }).then((pro2) => {
          userbase.Get_Products({ type: "Carbonate_drinks" }).then((pro3) => {
            userbase.Get_Products({ type: "Minaral_water" }).then((pro4) => {
              userbase.Get_Products({ type: "Candy" }).then((pro5) => {
                userbase.Get_Products({ type: "Others" }).then((pro6) => {
                  res.render('./user/first-page', { msg,admin: false, user: req.session.user, pro1, pro, pro2, pro3, pro4, pro5, pro6, count })

                })

              })

            })

          })

        })
      })

      })
    })
  }
  else {
    userbase.Get_Products({ type: "Heavy_food" }).then((pro) => {
      var pro1 = pro[0]
      // pro.shift()
      //console.log(pro);
      console.log(pro);
      userbase.Get_Products({ type: "Snacks" }).then((pro2) => {
        userbase.Get_Products({ type: "Carbonate_drinks" }).then((pro3) => {
          userbase.Get_Products({ type: "Minaral_water" }).then((pro4) => {
            userbase.Get_Products({ type: "Candy" }).then((pro5) => {
              userbase.Get_Products({ type: "Others" }).then((pro6) => {
                res.render('./user/first-page', { admin: false, user: req.session.user, pro1, pro, pro2, pro3, pro4, pro5, pro6 })

              })

            })

          })

        })

      })


    })
  }


});

router.get('/signup', (req, res) => {
  if (req.session.errmail) {
    res.render('./user/signup-page', { admin: false, mail: "This Mail Address Already Existing" })
    req.session.errmail = false
  }
  else {
    res.render('./user/signup-page', { admin: false })
  }

})
router.post('/signup', (req, res) => {

  userbase.Checking_Mailaderss_Is_Existing(req.body.email).then(async (resl) => {
    if (resl.mail) {
      req.session.errmail = true
      res.redirect('/signup')
    }
    else {
      console.log("Otp verification");
      signupstate.user = req.body.name;
      signupstate.ph = req.body.ph;
      signupstate.email = req.body.email;
      signupstate.password = req.body.password;
      //------OTP---------


      const accountSid = 'AC86bf867d4974f0444cb887bebebdebda';

      const authToken = 'a2da31ad592d978592ddcf7d34b7e951';

      const twilioPhoneNumber = '+13158886211';

      function generateOTP() {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      }

      // Function to send OTP via SMS
      function sendOTPSMS(phoneNumber, otp) {
        const client = twilio(accountSid, authToken);

        client.messages
          .create({
            body: `Your OTP is: ${otp} this otp valid only for 10 min please enter correct otp
        thankyou and grateday..`,
            from: twilioPhoneNumber,
            to: phoneNumber,
          })
          .then((message) => console.log(`OTP sent: ${message.sid}`))
          .catch((error) => console.error(`Failed to send OTP: ${error.message}`));
      }

      // Usage example
      const phoneNumber = '+91' + req.body.ph; // Replace with the recipient's phone number
      const otp = generateOTP();
      signupstate.otp = otp;

      await sendOTPSMS(phoneNumber, otp);

      res.redirect('/otp')
    }
  })

})
router.get('/otp', (req, res) => {
  if (req.session.otp) {
    res.render('./user/otp-validation', { admin: false, otperr: "Invalid OTP Please Enter Correct OTP..." })
    req.session.otp = false
  }
  else {
    res.render('./user/otp-validation', { admin: false })
  }
})
router.post('/otp', (req, res) => {

  if (signupstate.otp == req.body.otp) {
    userbase.Do_Signup({ ...signupstate }).then((data) => {
      res.redirect('/login')
    })

  }
  else {
    req.session.otp = true
    res.redirect('/otp')
  }

})
router.get('/reotp', (req, res) => {

  const accountSid = 'AC86bf867d4974f0444cb887bebebdebda';

  const authToken = '1f61bc99e54d15bd7141adb29054e88f';

  const twilioPhoneNumber = '+13158886211';

  function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  // Function to send OTP via SMS
  function sendOTPSMS(phoneNumber, otp) {
    const client = twilio(accountSid, authToken);

    client.messages
      .create({
        body: `Your OTP is: ${otp} this otp valid only for 10 min please enter correct otp
        thankyou and grateday..`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      })
      .then((message) => console.log(`OTP sent: ${message.sid}`))
      .catch((error) => console.error(`Failed to send OTP: ${error.message}`));
  }

  // Usage example
  const phoneNumber = '+91' + signupstate.ph; // Replace with the recipient's phone number
  const otp = generateOTP();
  signupstate.otp = otp;

  sendOTPSMS(phoneNumber, otp);
  res.redirect('/otp')
})

router.get('/login', (req, res) => {
  if (req.session.falselog) {
    res.render('./user/login-page', { admin: false, err: "Invalid Username or Password" })
    req.session.falselog = false
  }
  else {
    res.render('./user/login-page', { admin: false })
  }

})
router.post('/login', (req, res) => {
  userbase.Do_Login(req.body).then((state) => {
    console.log(state);
    if (state.status) {
      req.session.user = state
      console.log(req.session.user);
      req.session.status = true
      res.redirect('/')
    }
    else {
      req.session.falselog = true;
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login')
})
router.get('/intopro', verfyUserLogin, (req, res) => {
  //console.log(req.session.user._id);
  userbase.Get_Single_Products(req.query.id).then((product) => {
    userbase.Get_Cart_Count(req.session.user._id).then((count) => {
      if (Globalqut) {
        res.render('./user/single-product', { admin: false, user: req.session.user, product, count, cuterr: "Enter The Quantity inside" })
        Globalqut = false
      }
      else {
        if (successcut) {
          res.render('./user/single-product', { admin: false, user: req.session.user, product, count, succ: "Your Product Successfully Carted" })
          successcut = false
        }
        else {
          res.render('./user/single-product', { admin: false, user: req.session.user, product, count })
        }

      }
    })

  })
})
router.post('/cart', verfyUserLogin, (req, res) => {
  userbase.Get_Single_Products(req.query.id).then((pro) => {
    if (req.body.cut > pro.qun || req.body.cut <= 0) {
      Globalqut = true
      res.redirect('/intopro?id=' + req.query.id)
    }
    else {
      userbase.Do_Cart(req.session.user._id, req.query.id, req.body.cut).then((data) => {
        console.log(data);
      })
      successcut = true
      res.redirect('/intopro?id=' + req.query.id)
    }
  })
})
router.get('/viewcart', verfyUserLogin, (req, res) => {
  userbase.Get_Carted_Products(req.session.user._id).then((pro) => {
    userbase.Get_Total_price(req.session.user._id).then((total) => {
      res.render('./user/cart-page', { admin: false, user: req.session.user, pro, total })
    })
  })
})
router.get('/placeorder', verfyUserLogin, async (req, res) => {


  userbase.Get_Total_price(req.session.user._id).then((total) => {
    if (total == 0) {
      res.redirect('/viewcart')
    }
    else {
      console.log(total);
      res.render('./user/payment-page', { admin: false, user: req.session.user, total })
    }
  })
})
router.post('/placeorder', (req, res) => {

  req.body.date = new Date()
  req.body.userId = objectId(req.session.user._id)
  console.log(req.body);

  userbase.Get_products_From_Cart_Base(req.session.user._id).then((pro) => {
    console.log(pro);
    userbase.Get_Total_price(req.session.user._id).then((total) => {
      req.body.product = pro.products;
      req.body.total = total;
      req.body.status = req.body.pay === 'cod' ? 'placed' : 'penting';
      console.log(req.body);
      userbase.Get_order_placement(req.body).then(async(orderId) => {

        await qrcode.GenerateOrder_Qr_Code(orderId).then((data) => { console.log(data); })
        if (req.body.pay === 'cod') {
          res.json({ codstatus: true })
        }
        else {
          userbase.Generate__Razopay(orderId, total).then((response) => {
            res.json(response)
            console.log(response);
          })
        }
      })
    })
  })
})
router.get('/afterplaced', (req, res) => {
  var data = "Order Placed SuccessFully...."
  res.render('./user/success-order', { admin: false, user: req.session.user, data })
})

router.get('/vieworder', verfyUserLogin, (req, res) => {
  userbase.View_Orders_fROM_ORDER_bASE(req.session.user._id).then((info) => {
     console.log(info);

    res.render('./user/view-order', { admin: false, info, user: req.session.user })
  })
})
router.post('/verfypay', (req, res) => {
  console.log("hiiiiiiiiiiiiii", req.body);
  userbase.Verfy_Payment(req.body).then(() => {

    userbase.Chabge_PaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment success full...");
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false })
  })
})
router.get('/removecart', (req, res) => {
  userbase.Remove_cart_product(req.query.id, req.session.user._id).then((data) => {
    res.redirect('/viewcart')
  })
})

module.exports = router;
