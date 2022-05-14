const GameManager = require("./GameManager");

const YOUR_TURN = true;

class MatchMaker {
    constructor(soket) {
        this.socket = soket;
        this.match_making = [];
    }

    addUser(user) {
        this.match_making.push(user);
        this.match_making = [...new Map(this.match_making.map((item) => [item["ID"], item])).values()]
    }

    deleteUser(user){
        this.match_making = this.match_making.filter(function(value, index, arr){
            return value.ID != user.ID; 
        });
        console.log("deleted from match Maker");
        console.log(this.match_making);
    }

    getTwoRandomUsers(){
        const shuffled = [...this.match_making].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
      }
      

    makeGameForUsers() {
        if (this.match_making.length > 1) {
            const [user1, user2] = this.getTwoRandomUsers();
            this.sendInfo(user1, user2);
            GameManager.addGameParty(user1.sock_id, user2.sock_id);
            this.deleteUser(user1);
            this.deleteUser(user2);
        }
    }    

    sendInfo(user1, user2){
        this.socket.to(user1.sock_id).emit("init_game", user2.name, user2.sock_id, YOUR_TURN);
        this.socket.to(user2.sock_id).emit("init_game", user1.name, user1.sock_id, !YOUR_TURN);
    }

}

module.exports = MatchMaker;