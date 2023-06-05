var mongoClient = require('mongodb').MongoClient
var Promise = require('promise')

var state =
{
    db: null
}

module.exports =
{
    ConnectDatabase: () => {
        return new Promise((resove, reject) => {
            var dbname = "Cant_Eats_Eats";
            mongoClient.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true, useUnifiedTopology: true }, (err, data) => {
                if (err) {
                    reject("DataBase Connection Errorr...")
                }
                else {
                    state.db = data.db(dbname);
                    resove("DataBase Connection Successfull...",err)
                }
            })
        })
    },
    get: () => {
        return state.db;
    }
}