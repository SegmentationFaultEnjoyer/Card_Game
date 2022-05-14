import start_game from "./main.js";

const socket = io();

let player_info = null;
let op_name = null;
let playRoom = null;
let deck = null;
let IsMyTurn = null;
let AllCards = null;
let findGameBtn = document.querySelector("#find_game");


async function getUser() {
    let req = await fetch("/get_user");
    const player = await req.json();
    player.sock_id = socket.id;
    return player;
}

socket.on("connect", async () => {
    player_info = await getUser();
    findGameBtn.disabled = false;
    console.log(player_info);
    //socket.emit("initUser", player_info);
    document.getElementById("name").innerHTML = "Hi, "+player_info.name + "!"
})

socket.on("state", data => { //data is online players list, will use for matchmaking
    //console.log(data); 
})

document.getElementById("log_out").addEventListener("click", e => {
    document.location = "/log_out";
})

socket.on("init_game", (message, room, turn) => {
    playRoom = room;
    IsMyTurn = turn;
    op_name = message;
    console.log(message, room);
    console.log("is your turn - ", turn);
    socket.emit("init_game", player_info);
})

socket.on("init_card", (cards, assets) => {
    deck = cards;
    AllCards = assets;
    console.log(cards);
    document.open();
    document.close();
    
    start_game({
        socket: socket,
        room: playRoom,
        turn: IsMyTurn,
        player_info: player_info,
        op_name: op_name,
        deck: deck,
        assets: AllCards
    });
    
})


document.getElementById('decks').addEventListener('click', e => {
    document.location = '/decks_viewer';
})

let findSwitcher = false;

let loader = document.querySelector(".loader");


findGameBtn.addEventListener("click", e => {
    findSwitcher = !findSwitcher;
    if(findSwitcher){
        socket.emit("find_game", player_info);
        console.log('SEARCHING OPPONENT...');
        loader.style.visibility = "visible";
        findGameBtn.textContent = "Cancel";
    }
    else{
        socket.emit("cancel_find", player_info);
        loader.style.visibility = "hidden";
        findGameBtn.textContent = "Play";
    }
})

// window.onkeydown = function(e){
//     if(e.keyCode === 27){ // Key code for ESC key
//         e.preventDefault();
//     }
// };
