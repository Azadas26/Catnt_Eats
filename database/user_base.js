var db = require('../connection/connect')
var consts = require('../connection/constants')
var Promise = require('promise')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_lBqfqkZtfYY8r3',
    key_secret: 'N60QtTbxW5307iegUvyTeIt5',
});


module.exports =
{
    Do_Signup: (info) => {
        console.log(info);
        return new Promise(async (resolve, reject) => {
            info.password = await bcrypt.hash(info.password, 10)
            db.get().collection(consts.user_Base).insertOne(info).then((data) => {
                console.log(data);
                resolve(data)
            })
        })
    },
    Do_Login: (info) => {
        var state =
        {
            user: null,
            ph: null,
            email: null,
            status: null
        }
        return new Promise(async (resolve, reject) => {
            db.get().collection(consts.user_Base).findOne({ email: info.email }).then((details) => {
                //console.log(details);
                if (details) {
                    bcrypt.compare(info.password, details.password).then((value) => {
                        if (value) {
                            state.user = details.user;
                            state.ph = details.ph;
                            state.email = details.email;
                            state.status = true
                            details.status = true
                            console.log(details);
                            resolve(details)
                            console.log("Login SuccessFull...");
                        }
                        else {
                            console.log("Login Error...");
                            resolve({ status: false })
                        }
                    })
                }
                else {
                    console.log("Login Error...");
                    resolve({ state: false })
                }
            })
        })
    },
    Checking_Mailaderss_Is_Existing: (mail) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.user_Base).findOne({ email: mail }).then((res) => {
                console.log(res);
                if (res) {
                    resolve({ mail: true })
                    console.log("Hellooo");
                }
                else {
                    resolve({ mail: false })
                    console.log("Hiiiii");
                }
            })
        })
    },
    Get_Products: (tp) => {
        return new Promise(async (resolve, reject) => {
            var pro = await db.get().collection(consts.product_Base).find({ type: tp.type }).toArray()
            resolve(pro)
            //console.log(pro);
        })
    },
    Get_Single_Products: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.product_Base).findOne({ _id: objectId(Id) }).then((product) => {
                resolve(product)
            })
        })
    },
    Do_Cart: (userId, proId, cut) => {
        var proObj =
        {
            item: objectId(proId),
            qut: parseInt(cut)
        }
        return new Promise(async (resolve, reject) => {
            var cartpro = await db.get().collection(consts.cart_Base).findOne({ userid: objectId(userId) })
            if (cartpro) {
                db.get().collection(consts.cart_Base).updateOne({ userid: objectId(userId) },
                    {
                        $push:
                        {
                            products: proObj
                        }
                    }).then((data) => {
                        console.log(data);
                        resolve(data)
                    })
            }
            else {
                var state =
                {
                    userid: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(consts.cart_Base).insertOne(state).then((data) => {
                    console.log(data);
                    resolve(data)
                })
            }
        })
    },
    Get_Cart_Count: (userId) => {
        return new Promise(async (resolve, reject) => {
            var cartnum = 0;
            var cart = await db.get().collection(consts.cart_Base).findOne({ userid: objectId(userId) })
            if (cart) {
                cartnum = cart.products.length
            }
            console.log(cartnum);
            resolve(cartnum)

        })
    },
    Get_Carted_Products: (userid) => {
        return new Promise(async (resolve, reject) => {
            var cartitems = await db.get().collection(consts.cart_Base).aggregate([
                {
                    $match:
                    {
                        userid: objectId(userid)
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project:
                    {
                        item: '$products.item',
                        quantity: '$products.qut'
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.product_Base,
                        localField: "item",
                        foreignField: "_id",
                        as: 'product'

                    }
                },
                {
                    $project:
                    {
                        item: 1,
                        quantity: 1,
                        product:
                        {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }
            ]).toArray()
            console.log(cartitems);
            resolve(cartitems)
        })
    },
    Get_Total_price: (userId) => {
        return new Promise(async (resolve, reject) => {
            var total = await db.get().collection(consts.cart_Base).aggregate([
                {
                    $match:
                    {
                        userid: objectId(userId)
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project:
                    {
                        item: '$products.item',
                        quantity: '$products.qut'
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.product_Base,
                        localField: "item",
                        foreignField: "_id",
                        as: 'product'

                    }
                },
                {
                    $project:
                    {
                        item: 1,
                        quantity: 1,
                        product:
                        {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                },
                {
                    $group:
                    {
                        _id: null,
                        totalAmount: { $sum: { $multiply: ['$product.price', '$quantity'] } }
                    }
                }
            ]).toArray()
            console.log(total);
            if (total[0])
            {
                resolve(total[0].totalAmount)
            }
            else
            {
                resolve(0)
            }
            
        })
    },
    Get_products_From_Cart_Base: (userId) => {
        return new Promise(async (resolve, reject) => {
            var pro = await db.get().collection(consts.cart_Base).findOne({ userid: objectId(userId) })
            resolve(pro)
        })
    },
    Get_order_placement: (info) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.orders_Base).insertOne(info).then(async (data) => {
                await db.get().collection(consts.cart_Base).removeOne({ userid: objectId(info.userId) })
                resolve(data.ops[0]._id)
            })
        })
    },
    Generate__Razopay: (orderId, total) => {
        console.log("Hiii azaddd",orderId,total);
        return new Promise((resolve, reject) => {

            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: '' + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, (err, order) => {
                if (err) {
                    console.log("Erorr......", err);
                }
                else {
                    console.log(order);
                    resolve(order)
                }
            })

        })
    },
    View_Orders_fROM_ORDER_bASE: (userId) => {
        return new Promise(async (resolve, reject) => {
            var datas = await db.get().collection(consts.orders_Base).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },
                {
                    $unwind: "$product"
                },
                {
                    $project:
                    {
                        pay: 1,
                        date: 1,
                        total: 1,
                        userId: 1,
                        status: 1,
                        item: '$product.item',
                        quantity: '$product.qut'
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.product_Base,
                        localField: "item",
                        foreignField: "_id",
                        as: 'proo'
                    }
                },
                {
                    $project:
                    {
                        pay: 1,
                        date: 1,
                        total: 1,
                        userId: 1,
                        quantity: 1,
                        status: 1,
                        products: {
                            $arrayElemAt: ['$proo', 0]
                        }
                    }
                }

            ]).toArray()
            console.log(datas[0]);
            resolve(datas)
        })
    },
    Verfy_Payment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            const hmac = crypto.createHmac('sha256', 'N60QtTbxW5307iegUvyTeIt5');
            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
            let generatedSignature = hmac.digest('hex');

            if (generatedSignature == details['payment[razorpay_signature]']) {
                console.log("Azad checked");
                resolve()
            }
            else {
                reject()
            }
        })
    },
    Chabge_PaymentStatus: (orderId) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(consts.orders_Base).updateOne({ _id: objectId(orderId) },
                {
                    $set:
                    {
                        status: 'placed'
                    }
                }).then((data) => {
                    console.log(data);
                    resolve()
                })
        })
    },
    Remove_cart_product: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.cart_Base).updateOne({ userid: objectId(userId) },
                {
                    $pull: { products: { item: objectId(proId) } }
                }).then((data) => {
                    resolve(data);
                })
        })
    }
}