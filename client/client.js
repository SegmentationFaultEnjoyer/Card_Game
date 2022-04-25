const socket = io();
let player_info = JSON.parse(sessionStorage.getItem("player"));

console.log(player_info);

socket.emit("refresh", player_info);

socket.on("player_info", data => {
    sessionStorage.setItem("player", JSON.stringify(data));
})

socket.on("state", data => { //data is online players list, will use for matchmaking
    document.open();
    document.close()
    for(let user of data) {
        document.write(`<p>${user.name} ID = ${user.id} connected</p>`);
    }
})