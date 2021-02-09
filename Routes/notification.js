const express = require('express')
//const Auth=require('../middleware/Auth')
const Notificaiton=require('../Controller/notification')
const router = new express.Router()
// const test=require('../Controller/Test')

// send Account request 
//router.post('/instructor/signup', instructorController.idPic.single('idPic'),instructorController.Send_SingnUp_Request)


router.get('/Notification/Listme/:_id',Notificaiton.ListUserNotification);
router.post('/Notification/Create/:_id_to/:_id_from',Notificaiton.Create_Notification);
router.post('/Notification/Subscribe/:_id',Notificaiton.UserSubscribe);
router.delete('/Notification/Delete:_id',Notificaiton.DeleteNotification);

router.post('/Notification/Pushtest',Notificaiton.SendNotificationToUser);

//upload resources
//router.post('/upload/resources',Auth.Auth,Notify.GetNumberOfNotification,instructorController.resource.single('resource'),instructorController.enterResources)


// //upload image
// router.get('/Partation/GetMapPartation/:count/:verision/:_id',MapController.getMapPartation)


// router.post('/test',test.test2)

module.exports=router

