class GameManager {
    constructor() {
        this.playersArray = [];
    }

    addGameParty(sock_id1, sock_id2) {
        this.playersArray.push({ player1: sock_id1, player2: sock_id2 });
    }

    findOponent(sock_id) {
        for (const iterator of this.playersArray) {
            if (iterator.player1 === sock_id) {
                return iterator.player2;
            } else if (iterator.player2 === sock_id) {
                return iterator.player1;
            }
        }
    }

    deletePair(sock_id){
        for(let i = 0; i < this.playersArray.length; i++){
            if(this.playersArray[i].player1 === sock_id || this.playersArray[i].player2 === sock_id){
                this.playersArray.splice(i, 1);
                console.log("Session deleted suck");
                return;
            }
        }
    }

    checkDisconnectInGame(socket, user){
        const oponent = this.findOponent(user);
        if(!oponent)
            return;
        this.sendInfoDisconnect(socket, oponent);
        this.deletePair(user);
    }

    sendInfoDisconnect(socket, user) {
        socket.to(user).emit("game_over");
    }
}

module.exports = new GameManager();