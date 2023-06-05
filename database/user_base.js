var db = require('../connection/connect')
var consts = require('../connection/constants')
var Promise = require('promise')
var bcrypt = require('bcrypt')

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
                if (details) {
                    bcrypt.compare(info.password, details.password).then((value) => {
                        if (value) {
                            state.user = details.user;
                            state.ph = details.ph;
                            state.email = details.email;
                            state.status=true
                            resolve(state)
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
    }
}