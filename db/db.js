const mysql = require('mysql');
require('dotenv').config({ path: './configurations/dev.env' })
console.log(process.env.DB_host)
console.log(process.env.DB_user)
console.log(process.env.DB_Pass)
console.log(process.env.DB_DATABASE)
var connection = mysql.createConnection({
    host:process.env.DB_host,
    user:process.env.DB_user,
    password:process.env.DB_Pass,
    database:process.env.DB_DATABASE,
    port:process.env.DB_port,
});

try{
    connection.connect();
}catch(e){
console.log(e);
}
module.exports =connection;