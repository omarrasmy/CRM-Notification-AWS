const { request } = require('express')
var db=require('../db/db');

module.exports={
    setnewrequest: (newrequest,callback)=>{
        db.query("INSERT INTO `request` SET ?",newrequest,callback)
    },
    DeleteRequest:(requestKey,callback)=>{
       db.query("DELETE FROM `request` WHERE `requestKey`= ?",requestKey,callback)
    },
    GetspecificRequest:(requestKey,callback)=>{
        db.query("SELECT * FROM `request` WHERE `requestKey` LIKE ?",requestKey,(err,row)=>{
            if(err){
               return callback(err,null);
            }
            else{
                if(row.length == 0){
                    return callback({'error':"No Request Found"},null);
                }
                return callback(null,JSON.parse(JSON.stringify(row[0])));
            }
        })
    }
}
