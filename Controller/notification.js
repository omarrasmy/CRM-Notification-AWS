const socketIOClient = require('socket.io-client');
const { isObject } = require('util')

const ENDPOINT = 'http://127.0.0.1:' + process.env.PORT;
const socket = socketIOClient(ENDPOINT);

const notification= require('../Model/notification')
const user=require('../Model/user')
const webpush = require("web-push");

webpush.setVapidDetails(
    "mailto:omarrasmy00@gmail.com",
    process.env.publicVapidKey,
    process.env.privateVapidKey
);

exports.Create_Notification=async (req,res)=>{
    req.body=JSON.parse(JSON.stringify(req.body));
    if(req.body.hasOwnProperty("body") && req.body.body !="" && req.body.hasOwnProperty('title') && req.body.title !="" && req.body.hasOwnProperty("url") &&req.body.url!=""){
        if(req.params._id_to != req.params._id_from){
            user.GetSpecificUser(req.params._id_to,(err,response)=>{
                if(err){
                 return res.status(404).send({"message":"user Not Found"});
                }   
                user.GetSpecificUser(req.params._id_from,(err,resp)=>{
                    if(err){
                        return res.status(404).send({"message":"user Not Found"});
                    }
                    let not={"body":req.body.body,"seen":0,"title":req.body.title,"user_to":req.params._id_to,"user_from":req.params._id_from}
                    notification.CreateNotificaiton(not,(err,resp)=>{
                        if(err){
                            socket.emit('server_error',{'error':err,'option':req.params._id_from,'massage':'this user request for Notification have an error '});
                            return res.status(500).send({"message":"Can't Create Notificaiton Rigth Now !"})
                        }
                        //socket push
                        return res.status(200).send({"message":"Notificaiton Created"});
                    })
                })
            });
        }
    }
}

exports.ListUserNotification = async (req,res)=>{
    user.GetSpecificUser(req.params._id,(err,response)=>{
        if(err){
            return res.status(404).send({"message":"user Not Found"});
        }
        notification.ListUserNotification(req.params._id,(err,resp)=>{
            if(err){
                return res.status(404).send(err)
            }
            return res.status(200).send(resp);
                })
    })
}

exports.DeleteNotification = async(req,res)=>{
    notification.DeleteNotification(req.params._id,(err,resp)=>{
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).send({message:"Notification Deleted Successfully"});
    });
}
exports.UserSubscribe = async(req,res)=>{
    // user.GetSpecificUser(req.params._id,(err,response)=>{
    //     if(err){
    //         return res.status(404).send({message : "User Not Found"});
    //     }
    //     console.log(req.body);
    // });
    console.log(req.body);
    res.status(200).send();
}
exports.SendNotificationToUser = async(req,res)=>{
    var sub=JSON.parse(JSON.stringify(req.body));
    console.log(sub);
    const payload = JSON.stringify({ title: "Creative", body: "TestDescription", data: "http://deal360.ae" ,actions:[{action:'delete',title:'Delete'},{action:'reply',title:"new Reply"}]});
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
    res.status(200).send();
}