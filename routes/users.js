var express = require('express');
var router = express.Router();
const OTPGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const userbase= require('../database/user_base')


/* GET users listing. */
var signupstate =
{
  user: null,
  ph: null,
  email: null,
  password: null,
  otp: null
}

router.get('/', function (req, res, next) {
  res.render('./user/first-page', { admin: false })
});

router.get('/signup', (req, res) => {
  res.render('./user/signup-page', { admin: false })
})
router.post('/signup', (req, res) => {
  signupstate.user = req.body.name;
  signupstate.ph = req.body.ph;
  signupstate.email = req.body.email;
  signupstate.password = req.body.password;
  //------OTP---------

 
  const accountSid = 'AC86bf867d4974f0444cb887bebebdebda';
  const authToken = '840d7888ac33a6ab7a232fe515f6c3da';
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

  sendOTPSMS(phoneNumber, otp);

  res.redirect('/otp')

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
    userbase.Do_Signup({...signupstate}).then((data)=>
    {
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
  const authToken = '840d7888ac33a6ab7a232fe515f6c3da';
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
  if (req.session.falselog)
  {
    res.render('./user/login-page', { admin: false,err:"Invalid Username or Password" })
    req.session.falselog=false
  }
  else
  {
    res.render('./user/login-page', { admin: false })
  }
  
})
router.post('/login',(req,res)=>
{
    userbase.Do_Login(req.body).then((state)=>
    {
      console.log(state);
       if(state.status)
       {
          req.session.user=state
          req.session.status=true
          res.redirect('/')
       }
       else
       {
         req.session.falselog=true;
         res.redirect('/login')
       }
    })
})

module.exports = router;
