const express = require('express')
//const Auth=require('../middleware/Auth')
const MapController=require('../Controller/awsrequest')
const router = new express.Router()
// const test=require('../Controller/Test')

// send Account request 
//router.post('/instructor/signup', instructorController.idPic.single('idPic'),instructorController.Send_SingnUp_Request)


router.post('/Upload/AWSPHP',MapController.SendAWSPhp);
router.post('/test/php',MapController.Uploadfile.single('file'),MapController.SendAWSPhp2);
router.post('/Upload/Python/AWSPHP',MapController.AWS_Uzip);
router.post('/Upload/AWSUnzip/:_id',MapController.Uploadfile.single('file'),MapController.SendAWSPhp3);


//upload resources
//router.post('/upload/resources',Auth.Auth,Notify.GetNumberOfNotification,instructorController.resource.single('resource'),instructorController.enterResources)


// //upload image
// router.get('/Partation/GetMapPartation/:count/:verision/:_id',MapController.getMapPartation)


// router.post('/test',test.test2)

module.exports=router

