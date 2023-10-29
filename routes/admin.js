var express = require('express');
var router = express.Router();
var adminbase = require('../database/admin_base')
var objectId = require('mongodb').ObjectId;


var verfyAdmin = (req, res, next) => {
  if (req.session.admin) {
    next()
  }
  else {
    res.redirect('/admin')
  }

}
/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.adminerror) {
    res.render('./admin/login-page', { admin: true, err: "Invalid Username or Password" })
    req.session.adminerror = false
  }
  else {
    res.render('./admin/login-page', { admin: true })
  }

});
router.post('/login', (req, res) => {
  adminbase.Do_Admin_Login(req.body).then((state) => {
    if (state.status) {
      req.session.admin = true
      res.redirect('/admin/add')

    }
    else {
      req.session.adminerror = true;
      res.redirect('/admin/')
    }
  })
})
router.get('/logout',(req,res)=>
{
  req.session.admin = null
  res.redirect('/admin')
})
router.get('/add', verfyAdmin, (req, res) => {
  res.render('./admin/add-product', { admin: true ,adminlog:true})
})
router.post('/add', verfyAdmin, (req, res) => {
  req.body.qun = parseInt(req.body.qun)
  req.body.price = parseInt(req.body.price)
  adminbase.Add_Products(req.body).then(async (Id) => {
    console.log(Id);
    var image1 = req.files.image1;
    if (image1) {

      var image2 = req.files.image2;
      var image3 = req.files.image3;

      await image1.mv("public/adminpro-image/" + Id + "1.jpg", (err, data) => {
        if (err) {
          console.log(err);
        }
      })
      await image2.mv("public/adminpro-image/" + Id + "2.jpg")
      await image3.mv("public/adminpro-image/" + Id + "3.jpg")

    }
    adminbase.Add_Products_To_DUPLicate_Product_Base({ ...req.body, Id }).then(() => {
      res.redirect('/admin/add')
    })

  })
})
router.get('/viewpro', verfyAdmin, (req, res) => {
  adminbase.Get_All_Products().then((pro) => {
    res.render('./admin/view-products', { admin: true, pro,adminlog:true })
  })
})
router.get('/detete', verfyAdmin, (req, res) => {
  adminbase.Delete_Prdoducts(req.query.id).then((data) => {
    res.redirect('/admin/viewpro')
  })
})
router.get('/edit', (req, res) => {
  adminbase.Find_One_product_For_Editing(req.query.id).then((pro) => {
    res.render('./admin/edit-page', { admin: true, pro ,adminlog:true})
  })
})
router.post('/edit',verfyAdmin, (req, res) => {
  adminbase.Edit_Product_Information(req.query.id, req.body).then(async (data) => {
    res.redirect('/admin/viewpro')
    var image1 = req.files.image1;
    var image2 = req.files.image2;
    var image3 = req.files.image3;
    if (image1) {
      await image1.mv("public/adminpro-image/" + req.query.id + "1.jpg", (err, data) => {
        if (err) {
          console.log(err);
        }
      })
    }
    if (image2) {
      await image2.mv("public/adminpro-image/" + req.query.id + "2.jpg", (err, data) => {
        if (err) {
          console.log(err);
        }
      })
    }
    if (image3) {
      await image3.mv("public/adminpro-image/" + req.query.id + "3.jpg", (err, data) => {
        if (err) {
          console.log(err);
        }
      })
    }

  })
})
router.get('/orders',verfyAdmin,(req,res)=>
{
  adminbase.Get_Order_Details_From_User_side().then((info)=>
  {
    //console.log(info);
     res.render('./admin/view-orders',{admin:true,pro:info,adminlog:true})
  })
})
router.get('/giveproducts',verfyAdmin,(req,res)=>
{
  console.log(req.query.id);
  adminbase.Get_Order_By_Scanning(req.query.id).then((info) => {
    //console.log(info);
    res.render('./admin/giveproduct',{admin:true,info,adminlog:true})
  })
})
router.get('/adminorder',verfyAdmin,(req,res)=>
{
   console.log(req.query.id,"***************",req.query.userid);
   console.log('DDDDDD');
   adminbase.Remove_user_Orders_after_admin_Validated(req.query.id,req.query.userid).then((data)=>
   {
        res.redirect('/admin/viewpro')
   })
})
router.post('/usermessage',(req,res)=>
{
   console.log(req.body);
   console.log(req.query);
  adminbase.Admin_Message_TO_Usewr(req.query.userid,req.query.proid,req.body).then((data)=>
  {
    console.log(data);
    res.redirect('/admin/orders')
  })
})

module.exports = router;
