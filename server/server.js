const PORT = process.env.PORT ?? 8080;
const HOST = get_host();
const express = require('express');

const path = require('path');
const home_dir = path.resolve();
const auth_router = require('./../routers/auth-routes');
const cookieParser = require("cookie-parser");


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.io = io;
const IoRouter = require("./../controllers/io-controllers")(app.io);



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use(auth_router);

server.listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}`));


function get_host() {
    const ifaces = require('os').networkInterfaces();
    const localhost = Object.keys(ifaces).reduce((host,ifname) => {
    let iface = ifaces[ifname].find(iface => !('IPv4' !== iface.family || iface.internal !== false));
    return iface? iface.address : host;
}, '127.0.0.1');
    return localhost;
}
app.use(express.static(__dirname + './../public'));
app.use(express.static(__dirname + './../views'));

