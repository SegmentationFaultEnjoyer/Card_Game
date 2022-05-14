let Model = require('../model');

class Card extends Model {
    constructor() {
        super('cards');
    }
    async setCards(data) {
        for(let i of data)
            await this.save(i)
    }
    async getCards(){
        return this.getAll();
    }
    getRandomCards(array, n) {
        return array.sort(() => 0.5 - Math.random()).slice(0, n);
    }
}

module.exports = new Card();
