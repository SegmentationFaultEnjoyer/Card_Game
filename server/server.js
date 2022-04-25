const PORT = process.env.PORT ?? 8080;
const HOST = get_host();
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const socket = socketIO(server);

const User = require('../data_base/models/user');

function get_host() {
    const ifaces = require('os').networkInterfaces();
    const localhost = Object.keys(ifaces).reduce((host,ifname) => {
    let iface = ifaces[ifname].find(iface => !('IPv4' !== iface.family || iface.internal !== false));
    return iface? iface.address : host;
}, '127.0.0.1');
    return localhost;
}

const home_dir = path.resolve();
let user = new User(); user.ID = -1; user.name = "test"

app.use(express.json());
app.use(express.static(path.join(home_dir, 'client'))); 

app.get("/", (req, resp) => {
    resp.sendFile(path.join(home_dir, 'views', 'index.html'))
})
app.get("/public/style.css", (req, resp) => {
    resp.sendFile(path.join(home_dir, 'public', 'style.css'));
})
app.get("/reg", (req, resp) => {
    resp.sendFile(path.join(home_dir, 'views', 'reg.html'));
})
app.get("/game", (req, resp) => {
    resp.sendFile(path.join(home_dir, 'client', 'game.html'));
})

app.post("/reg_user", (req, resp) => {
    let new_user = new User(
        req.body.login,
        req.body.password,
        req.body.name,
        req.body.email
    );
    new_user.save().then(err => {
        let error_info = null;
        if(err != undefined) {
            error_info = err.message.indexOf('login') != -1 ? 'login' : 'email';
        }
        resp.json(error_info);
    });
})

app.post("/log_in", (req, resp) => {
    user = new User(req.body.login, req.body.password);
    user.find(null).then(res => {
        if(res == "NOT FOUND" || req.body.password != user.password)
            resp.json({found: false});
        else {
            resp.json({
                found: true, 
                status: user.status,
                name: user.name,
                email: user.email,
            });
        }
    });
})

let online_players = [];

socket.on("connection", sock => {
    console.log(`${user.name} CONNECTED`);

    sock.on("refresh", data => {
        if(data) {
            sock.cur_player = data;
            sock.cur_player.sock_id = sock.id;
        }
        else
            sock.cur_player = {
                id: user.ID,
                sock_id: sock.id,
                name: user.name,
            };
        console.log(data, sock.cur_player);
        if(!online_players.find(el => el.id == sock.cur_player.id)) {
            console.log("NEW PLAYER PUSHED");
            online_players.push(sock.cur_player);
            socket.emit("player_info", sock.cur_player);
            console.log(online_players);
        }    
        socket.emit("state", online_players);
    })

    sock.on("disconnect", () => {
        console.log("DISCONNECTED");
        online_players = online_players.filter(player => player.sock_id != sock.id);
        socket.emit("state", online_players);
    })
})


//192.168.0.191
server.listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}`));
