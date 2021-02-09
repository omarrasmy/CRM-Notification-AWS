var db=require('../db/db');

module.exports={
    GetSpecificUser: (id,callback)=>{
        db.query("SELECT * FROM `users` WHERE ID=?",id,callback)
    },
    GetUsers:(requestKey,callback)=>{
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
