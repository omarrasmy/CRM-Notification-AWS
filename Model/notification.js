var db=require('../db/db');

module.exports={
    CreateNotificaiton: (options,callback)=>{
        db.query("INSERT INTO `notifications` SET?",options,callback)
    },
    GetUsers:(ID,callback)=>{
        db.query("SELECT * FROM `notifications` WHERE `user_to` = ?",ID,(err,row)=>{
            if(err){
               return callback(err,null);
            }
            else{
                if(row.length == 0){
                    return callback({'message':"No Notificaiton Found"},null);
                }
                row=JSON.parse(JSON.stringify(row))
                // row.forEach((element)=>{
                //     delete element.id;
                // })
                return callback(null,row);
            }
        });
    },
    DeleteNotification:(ID,callback)=>{
        db.query("DELETE FROM `notifications` WHERE ID = ?",ID,callback);
    }
}
