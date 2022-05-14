const mysql = require('mysql2')
const config = require('./config.json');



module.exports = async function connect() {
    return await mysql.createConnection(config)
};

