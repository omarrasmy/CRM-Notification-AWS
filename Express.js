const express = require('express');
require('dotenv').config({ path: './configurations/dev.env' })
const path =require('path')
const AWSUpload = require('./Routes/awsrequest')
const Notification =  require('./Routes/notification');
console.log("test")

const app = express()
app.use((req, res, next) => {
    var allowedOrigins = ['https://realquizly.web.app', 'http://localhost:8080','http://localhost:4200','http://localhost:3500' , "https://youthful-boyd-4eb098.netlify.app" ];
    var origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    res.append('Access-Control-Allow-Headers', 'Authorization');
    next();
});
var http = require('http').createServer(app);
//app.use(express.static(path.join(__dirname, "JavaScript")));
const port = process.env.PORT;
const io = require('socket.io')(http,{
        cors: {
            origin:['http://localhost:4200','http://localhost:3500','http://localhost:8080' ],
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
      });


app.use(express.json({limit: '10mb'}))
app.use(AWSUpload);
app.use(Notification);
http.listen(port, function () {
    console.log("Listening on ", port);
});
app.use(express.static(path.join(__dirname,'public/client')));



io.on('connection', function (socket) {
    socket.on('server_error',(obj)=>{
        console.log(obj)
        //some operation
    })
    socket.on('Error', () => {
        console.log('Error In Uploaded')
        io.emit('Error-uploaded');
    });
    socket.on('Success',()=>{
        console.log('Uploaded Successfully')
        io.emit('uploaded')
    });
    socket.on('Success2',()=>{
        console.log('Uploaded Successfully2')
        io.emit('uploaded2')
    });    
    socket.on('Success3',(data)=>{
        console.log('Uploaded_Successfully')
        console.log(data);
        io.emit('unzip',data);
    });    
    socket.on('Delete',()=>{
        console.log("Can't Deleted");
        io.emit("Error-Deleted")
    });
      
});
