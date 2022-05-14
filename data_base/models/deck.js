let Model = require('../model');
const mysql = require('../db.js');

class Deck extends Model {
    constructor() {
        super('decks');
    }
    async setDecks(data) { // [{name: 'name', user_id: id_of_owner, cards: array_of_cards_id},{...}]
        for(let i of data) {
            await this.save({name: i.name, user_id: i.user_id});
            let decks = await this.find({name: i.name});
            for (let deck of decks){
                for (let card_id of i.cards) {                    
                    let con = await mysql();
                    con.connect();
                    for (let deck of decks) {
                        let query = `INSERT INTO decks_cards (deck_id, card_id) VALUES (${deck.id}, ${card_id})`
                        const [rows, fields] = await con.promise().query(query);
                        deck.cards = rows;
                    }
                    con.end();
                }
            }
        }
        return true
    }
    async getUserDecks(data) { //exmp id, name or user_id
        let con = await mysql();
        con.connect();
        try {
            let conditions = [];
            for (let key in data) {
                if (key == 'starter') continue;
                if (key !== "id") {
                    conditions.push(`${key}='${data[key]}'`);
                } else {
                    conditions.push(`${key}=${data[key]}`)
                }
            }
            let str = "";
            for (let i = 0; i < conditions.length; i++) {
                if (i == conditions.length - 1) {
                    str += conditions[i];
                } else {
                    str += conditions[i] + ` AND `;
                }
            }
            if (data.starter)
                str += ' OR user_id IS NULL';
            const [rows, fields] = await con.promise().query(`SELECT * FROM ${this.table} WHERE ${str}`);
            let decks = rows;
            
            for (let deck of decks) {
                let query = `SELECT cards.* FROM decks
                JOIN decks_cards ON decks.id = decks_cards.deck_id
                JOIN cards ON cards.id = decks_cards.card_id
                WHERE decks.id = ${deck.id}`
                const [rows, fields] = await con.promise().query(query);
                deck.cards = rows;
            }
            con.end();
            return decks
        } catch (e) {
            console.log(e)
            con.end();
            throw e;
        }
    }
}
// async function main()
// {let deck = new Deck();
// // await deck.setDecks([{name: "Starter Pack", user_id: 21, cards:[1, 11, 21]}])
//     let decks = await deck.getUserDecks({user_id: 21});
//     for (let i of decks) {
//         console.log(i.name);
//         for (let j of i.cards)
//             console.log(j.name);
//     }
// }
// main()
module.exports = new Deck();
