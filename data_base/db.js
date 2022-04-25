const mysql = require("mysql2");
const config = require("./config.json");

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.host,
    user: config.user,
    password: config.password, 
    database: config.database
}).promise();

module.exports = pool;