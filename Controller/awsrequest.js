const multer = require('multer')
const path1 = require('path')
const AWS = require('aws-sdk')
const awsrequest=require('../Model/aws_model')
const request=require('request')

const socketIOClient = require('socket.io-client');
const { isObject } = require('util')

const ENDPOINT = 'http://127.0.0.1:' + process.env.PORT;
const socket = socketIOClient(ENDPOINT);


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var params = {
    Bucket: process.env.BUCKET_NAME,
    ACL: 'public-read'
};
// function Get_key(key){
//     key=key.split('/');
//     return key[key.length - 2]+'/'+key[key.length - 1];
// }

async function AWS_Upload(obj,callback) {
     s3.upload(params, (err, data) => {
        if (err) {
                console.log(err)
                socket.emit('Error')
                callback(err,obj);
        }
        else {
            socket.emit('Success'); 
            callback(null,obj)   
        }
    });


}
function AWS_CheckObject(Key,callback) {
    params.Key = Key;
    var newparams =  Object.keys(params).reduce((object, key) => {
        if (key != "ACL" && key != "Body" && key!= "ContentType") {
          object[key] = params[key]
        }
        return object
      }, {})
    s3.headObject(newparams,callback);
}
async function AWS_Delete(Key) {
    params.Key = Key;
    var newparams =  Object.keys(params).reduce((object, key) => {
        if (key != "ACL" && key != "Body" &&key != 'ContentType') {
          object[key] = params[key]
        }
        return object
      }, {})
    s3.deleteObject(newparams, (err, data) => {
        if (err) {
            console.log(err, err.stack);
            socket.emit('Delete');
            throw err;

        } // error
        else {
            console.log('Delete');   
        }
                        // deleted
    });
}


// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'SVGFile')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + '.jpg')
//     }
// })


exports.Uploadfile = multer({
    // fileFilter(req, file, cb) {
    //     if (!file.originalname.match(/\.(svg)$/)) {
    //         return cb(new Error('Please Upload A SVG File'));
    //     }
    //     cb(undefined, true);
    // }

});

// exports.test=async(req,res)=>{
//     try{
//     if(req.file!="" && req.hasOwnProperty("file")){
//         path=req.file.destination+ '/' + req.file.filename;
//         console.log(path)
//         if(req.hasOwnProperty('body')){
//             console.log(req.body.Name);
//         }
//         res.send()
//     }
// }catch(e){

//     res.send(e)
// }
// }







function jsonEscape(str)  {
    return str.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/['"]+/g, '\\"');
}

exports.SendAWSPhp=async (req,res)=>{
    try{
    MyFile =req.body.file
    req.body=JSON.parse(JSON.stringify(req.body))
    console.log(req.body)
    x=MyFile.originalname.split('.')
    x='.'+x[x.length-1]
    y=null;
    if(req.body.hasOwnProperty("unzip")){
        if(req.body.unzip == true || req.body.unzip == "true" ){
            params.Key='Files/'+process.env.AppAccess+'/'+Date.now()
            y=params.Key
            params.Key=params.Key+'/'+MyFile.fieldname + '-' + Date.now() + x;
            params.ContentType=MyFile.mimetype;
         }
         else{
            params.Key='Files/'+MyFile.fieldname + '-' + Date.now() + x;
         }

    }
    else{
        params.Key='Files/'+MyFile.fieldname + '-' + Date.now() + x;    
    }
    x=params.Key
    params.Body= Buffer.from(MyFile.buffer)
    if(req.body.hasOwnProperty("download")){
     if(req.body.download == true || req.body.download == "true" ){
        params.ContentType=""
     }
     else{
        params.ContentType=MyFile.mimetype;
     }   
    }
    else{
        params.ContentType=MyFile.mimetype;
    }
    let Obj =  await AWS_Upload(false,{ check: false });
    console.log(Obj)
    if(req.body.hasOwnProperty("unzip")){
        if(req.body.unzip == true || req.body.unzip == "true" ){
            return res.status(200).send({"Massege":"Please Wait While Do Some Operation","ExpectedUrl":"https://deal360-photographer.s3.amazonaws.com/"+y});
         }
        }
    return res.status(200).send({"Url":"https://deal360-photographer.s3.amazonaws.com/"+x})
    }catch(e){
        console.log(e);
        return res.status(400).send({"Error":e});
    }
}
exports.SendAWSPhp3=async (req,res)=>{
    try{
    MyFile =req.file
    req.body=JSON.parse(JSON.stringify(req.body))
    y=false;
    let obj ={};
    obj.check=y;
    if(req.body.hasOwnProperty('unzip') && (req.body.unzip == true || req.body.unzip=="true")){
        requestKey=objectId();
        prefix='Files/'+process.env.AppAccess+'/'+Date.now()+'-'+requestKey
        y=true
        obj.check = y;
        obj.requestKey=requestKey;
        Form_key(prefix,MyFile.originalname);
        // params.Key=params.Key+'/'+MyFile.fieldname + '-' + Date.now() + x; 
        var newrequest={user_ID:req.params._id,requestKey}
        awsrequest.setnewrequest(newrequest,(err,ress)=>{
            if(err){
                console.log(err)
                socket.emit('Error')
                socket.emit('server_error',{'error':err,'option':req.params._id,'massage':'this user request have an error '});
            }
        })
    }
    else{
        // params.Key='Files/'+MyFile.fieldname + '-' + Date.now() + x;
        Form_key("Files",MyFile.originalname)
    }
    params.ContentType=MyFile.mimetype;
    x=params.Key
    params.Body= MyFile.buffer
    if(req.body.hasOwnProperty("download") && ( req.body.download ==true || req.body.download == "true")){
        params.ContentType="";
    }
    AWS_Upload(obj,(err,res)=>{
        if(res.check && err){
            awsrequest.DeleteRequest(res.requestKey,(err,res)=>{
                socket.emit('server_error',{'error':err,'option':requestKey,'massage':'this request have an error '});
            });
        }
    });
    if(y){
            return res.status(200).send({"Massege":"Please Wait While Do Some Operation"});         
        }
    return res.status(200).send({"Url":"https://deal360-photographer.s3.amazonaws.com/"+x})
    }catch(e){
        console.log(e);
        return res.status(400).send({"Error":e});
    }
}

exports.SendAWSPhp2=async (req,res)=>{
    try{
    const Url='https://dcity360.herokuapp.com/Upload/AWSPHP'
    var Body = {file:req.file}
    req.body=JSON.parse(JSON.stringify(req.body))
    if(req.body.hasOwnProperty('download')){
        console.log('im in ');
        Body.download=req.body.download
    }
    if(req.body.hasOwnProperty("unzip")){
        Body.unzip=req.body.unzip;
    }
       await request.post({url:Url,json:true,body: Body},(error,response)=>{
       if(error){
           return res.status(404).send(error);
       }
       else{
           if(response.status_code==404){
               console.log("error");
            return res.state(404).send({'massage':'some information Are Massed'})   
           }
           return res.status(200).send(response)
       }
    
    })
}catch(e){
    console.log(e)
    return res.status(400).send({"Error":e})
}}
exports.AWS_Uzip = async (req, res) => {
    try {
        // console.log(req.body)
        // console.log(req.body.hasOwnProperty('FileExecution')  );
        if (req.body.hasOwnProperty('FileExecution') && req.body.FileExecution != '' && req.body.hasOwnProperty('API') && req.body.API != '') {
            if (req.body.API != process.env.publicVapidKey) {
                return res.status(500).send({ 'massage': 'not Allowed For Userss' })
            }
            var newparams = Object.keys(params).reduce((object, key) => {
                if (key != "ACL" && key != "Body" && key != 'Key' && key != 'ContentType') {
                    object[key] = params[key]
                }
                return object
            }, {})
            newparams.Prefix = req.body.FileExecution
            console.log(newparams);
            newparams.Bucket="deal360-photographer"
            AWS_Uzip2(newparams, req.body.FileExecution,(err,res)=>{
                if(err){
                    awsrequest.DeleteRequest(res,(errr,ress)=>{
                        socket.emit('server_error',{'error':err,'option':res,'massage':'this request have an error '});
                    });
                }
                else{
                    awsrequest.GetspecificRequest(res.id,(err,row)=>{
                        if(err){
                            socket.emit('server_error',{'error':err,'option':res.id,'massage':'this request have an error '})
                        }
                        else{
                            console.log(res);
                            
                            socket.emit('Success3',{"data":res,"user":row});
                        }
                       
                    })
                }
            })
            return res.status(200).send({ 'massage': 'do Some operation' })
        }
        else {
            return res.status(500).send({ 'massage': 'not Allowed For Users' });
        }

    }
    catch (E) {
        socket.emit('Error')
        res.status(500).send({ 'massage': 'Something went Wrong' })

    }
}
async function AWS_Uzip2(newparams, FileExecution,callback) {
    id = FileExecution.substring( FileExecution.lastIndexOf("/") + 1,FileExecution.length).split('-')[1];
    console.log(id)
    var urll="https://deal360-photographer.s3.amazonaws.com/";
    try {
        s3.listObjectsV2(newparams, async (err, data) => {
            if (err) {
                console.log(err, err.stack);
                socket.emit('Error')
                callback(err,id)
            }
            // an error occurred
            var MyKey = 0;
            var MyPhoto ="";
            var DemoPhoto="";
            var file;
            checkPhoto=true
            for (var file of data.Contents) {
                if (file.Key.endsWith('index.html')) {
                    MyKey = file.Key
                }
                if(checkPhoto){
                if(file.Key.match(/\.(jpg||png||jpeg)$/) && file.Key.includes('tiles')){
                    MyPhoto = file.Key
                    checkPhoto=false
                }
                else if(DemoPhoto !=""){
                    if(file.Key.match(/\.(jpg||png||jpeg)$/)){
                        DemoPhoto = file.Key
                    }
                }
            }
            if(MyKey != 0 && !checkPhoto){
                break;
            }
            }
            if (MyKey != 0) {
                    Package3D =urll+ MyKey;
                    if(MyPhoto != ""){
                        Package3DPhoto = urll + MyPhoto;
                    }
                    else if(DemoPhoto != ""){
                        Package3DPhoto = urll + DemoPhoto;
                    }
                    else{
                        Package3DPhoto = urll + '/Default/no_image.png';
                    }
                    callback(null,{'id':id,"Package3DPhoto":Package3DPhoto,"Package3D":Package3D})
                    socket.emit('Success3',{"Package3DPhoto":Package3DPhoto,"Package3D":Package3D});
            }
            else {
                socket.emit('Error')
                AWS_Delete_Objects(FileExecution)
            }

        });
    } catch (e) {
        console.log(e)
    }


}
async function AWS_Delete_Objects(dir) {
    const listParams = {
        Bucket: "deal360-photographer",
        Prefix: dir
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: "deal360-photographer",
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await AWS_Delete_Objects(dir);
}
function Form_key(prefix, filename) {
    filename=filename.replace(/ /g,'_');
    params.Key = prefix+ '/' + Date.now() + '-' + filename;
    // + params.Key.split('/')[0]
    return 'https://deal360-photographer.s3.amazonaws.com/';
}
function objectId() {
    const os = require('os');
    const crypto = require('crypto');
    console.log(Math.floor(new Date()/1000).toString(16))
    const secondInHex = Math.floor(new Date()/1000).toString(16);
    const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6);
    const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');
    const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0');

    return secondInHex + machineId + processId + counter;
}
