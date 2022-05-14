
const MatchManager = require("./soketManager/MatchMaker");
const GameManager = require("./soketManager/GameManager");
const CardDB = require("./../data_base/models/card");
const DeckDB = require("./../data_base/models/deck");
let online_players = [];
let cards;
CardDB.getCards().then((arr) => {
    cards = arr;
});

module.exports = (socket) => {
    const matchManager = new MatchManager(socket);
    socket.on("connection", sock => {
        console.log("User Connected");
        sock.on("initUser", user => {
            online_players.push(user);
            socket.emit("state", online_players)
        })
        sock.on("find_game", user => {
            matchManager.addUser(user);
            matchManager.makeGameForUsers();
        })

        sock.on("ready", user => {
            socket.to(user).emit("ready");
        })

        sock.on("cancel_find", user => {
            matchManager.deleteUser(user);
            console.log(matchManager.match_making);
        })

        sock.on("get_cards", () =>{
            sock.emit("get_cards",cards);
        })
    
        sock.on("init_game", async (user) => {
            let deck = await DeckDB.getUserDecks({id: user.deck_id, starter: false});

            sock.emit("init_card", await CardDB.getRandomCards(deck[0].cards, deck[0].cards.length), cards.map(el => el = el.name));
        })

        sock.on("drag_start", (index, enemy) => {
            sock.to(enemy).emit("drag_start", index);
        })

        sock.on("drag_end", enemy => {
            sock.to(enemy).emit("drag_end");
        })

        sock.on("card_played", (card, enemy) => {
            sock.to(enemy).emit("card_played", card);
        })

        sock.on("change_turn", (enemy) => {
            sock.to(enemy).emit("change_turn");
        })

        sock.on("card_attacked", (data, enemy) => {
            sock.to(enemy).emit("card_attacked", data);
        })

        sock.on("ability_use", (info, target, enemy) => {
            sock.to(enemy).emit("ability_use", info, target);
        })

        sock.on("target_pick", (source, targets, board, enemy) => {
            sock.to(enemy).emit("target_pick", source, targets, board);
        })

        sock.on("target_picked", (enemy) => {
            sock.to(enemy).emit("target_picked");
        })

        sock.on("mana_stone", (enemy) => {
            sock.to(enemy).emit("mana_stone");
        })

        sock.on("game_over", (enemy) => {
            sock.to(enemy).emit("game_over");
        })

        

        sock.on("disconnect", () => {
            console.log("disconnect ", sock.id);
            matchManager.deleteUser(online_players.filter(player => player.sock_id == sock.id));
            online_players = online_players.filter(player => player.sock_id != sock.id);
            GameManager.checkDisconnectInGame(socket, sock.id);
            socket.emit("state", online_players);
        })
    })
}
