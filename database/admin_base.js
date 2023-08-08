var db = require('../connection/connect')
var consts = require('../connection/constants')
var Promise = require('promise')
var bcrypt = require('bcrypt')
const e = require('express')
var objectId = require('mongodb').ObjectId

module.exports =
{
    Do_Admin_Login: (info) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.admin_Base).findOne({ name: info.name }).then((data) => {
                if (data) {
                    if (info.password == data.password) {
                        console.log("Admin Login Successfull...");
                        resolve({ status: true })
                    }
                    else {
                        console.log("Admin Login Error...");
                        resolve({ status: false })
                    }
                }
                else {
                    console.log("Admin Login Error...");
                    resolve({ status: false })
                }
            })
        })
    },
    Add_Products: (pro) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.product_Base).insertOne(pro).then((data) => {
                resolve(data.ops[0]._id);
            })
        })
    },
    Add_Products_To_DUPLicate_Product_Base: (pro) => {
        console.log(pro);
        return new Promise((resolve, reject) => {
            db.get().collection(consts.product_Base_Duplicate).insertOne(pro).then(() => {
                resolve()
            })
        })
    },
    Get_All_Products: () => {
        return new Promise(async (resolve, reject) => {
            var pro = await db.get().collection(consts.product_Base).find().toArray()

            resolve(pro)

        })
    },
    Delete_Prdoducts: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.product_Base).removeOne({ _id: objectId(Id) }).then((data) => {
                //console.log(data);
                resolve(data)
            })
        })
    },
    Find_One_product_For_Editing: (Id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.product_Base).findOne({ _id: objectId(Id) }).then((pro) => {
                resolve(pro)
            })
        })
    },
    Edit_Product_Information: (Id, data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.product_Base).updateOne({ _id: objectId(Id) },
                {
                    $set:
                    {
                        pname: data.pname,
                        type: data.type,
                        qun: data.qun,
                        price: data.price,
                        description: data.description
                    }
                }).then((data) => {
                    console.log(data);
                    resolve(data)
                })
        })
    },
    Get_Order_Details_From_User_side: () => {
        return new Promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.orders_Base).aggregate([
                {
                    $unwind: '$product'
                },
                {
                    $project:
                    {
                        name: 1,
                        address: 1,
                        location: 1,
                        pay: 1,
                        date: 1,
                        userId: 1,
                        item: "$product.item",
                        qut: "$product.qut",
                        total: 1,
                        status: 1
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.product_Base,
                        localField: "item",
                        foreignField: "_id",
                        as: "pro"
                    }
                },
                {
                    $project:
                    {
                        name: 1,
                        address: 1,
                        location: 1,
                        pay: 1,
                        date: 1,
                        userId: 1,
                        item: 1,
                        qut: 1,
                        total: 1,
                        status: 1,
                        pro: {
                            $arrayElemAt: ["$pro", 0]
                        }
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.user_Base,
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $project:
                    {
                        name: 1,
                        address: 1,
                        location: 1,
                        pay: 1,
                        date: 1,
                        userId: 1,
                        item: 1,
                        qut: 1,
                        total: 1,
                        status: 1,
                        pro: 1,
                        user: {
                            $arrayElemAt: ["$user", 0]
                        }
                    }
                }
            ]).toArray()
            resolve(info)
        })
    },
    Get_Order_By_Scanning: (Id) => {
        return new Promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.orders_Base).aggregate([
                {
                    $match:
                    {
                        _id: objectId(Id)
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project:
                    {
                        name: 1,
                        address: 1,
                        location: 1,
                        pay: 1,
                        date: 1,
                        userId: 1,
                        item: "$product.item",
                        qut: "$product.qut",
                        total: 1,
                        status: 1
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.product_Base,
                        localField: "item",
                        foreignField: "_id",
                        as: "pro"
                    }
                },
                {
                    $project:
                    {
                        name: 1,
                        address: 1,
                        location: 1,
                        pay: 1,
                        date: 1,
                        userId: 1,
                        item: 1,
                        qut: 1,
                        total: 1,
                        status: 1,
                        pro: {
                            $arrayElemAt: ["$pro", 0]
                        }
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.user_Base,
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $project:
                    {
                        name: 1,
                        address: 1,
                        location: 1,
                        pay: 1,
                        date: 1,
                        userId: 1,
                        item: 1,
                        qut: 1,
                        total: 1,
                        status: 1,
                        pro: 1,
                        user: {
                            $arrayElemAt: ["$user", 0]
                        }
                    }
                }
            ]).toArray()
            resolve(info)
        })
    },
    Remove_user_Orders_after_admin_Validated: (orderId, userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.orders_Base).removeOne({ _id: objectId(orderId), userId: objectId(userid) }).then((data) => {
                resolve(data)
            })
        })
    },
    Admin_Message_TO_Usewr: (userId, proId, msg) => {
        return new Promise(async (resolve, reject) => {
            console.log("Hello worldd");
            var state =
            {
                UserId: objectId(userId),
                ProId: objectId(proId),
                message: msg,
                Date: new Date()
            }
            db.get().collection(consts.adminmessage).insertOne(state).then((data) => {
                resolve(data)
                console.log(data);
            })

        })
    }
}

