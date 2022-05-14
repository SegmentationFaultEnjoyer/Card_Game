import CardPlayable from "./CardPlayable.js";
import CardBase from "./CardBase.js";
import { 
    get_top_card_coords, 
    centerlize_cards, 
    arrange_layers 
} from "../helpers/card_arrangment.js";

const delay = ms => new Promise(r => setTimeout(() => r(), ms));

export default class Dealer {
    constructor(scene, deck) {
        this.scene = scene;
        this.maxCards = 8;
        this.deck = deck;
        this.deal_sound = scene.sound.add('deal');
    }

    createDeck() {
        let fontConfig = {
            fontFamily: 'Arial',
            fontSize: '60px',
            stroke: 'black',
            strokeThickness: 3
        }
        this.mydeckSprites = [];
        this.opdeckSprites = [];
        for(let i = 0; i < this.deck.length; i++) {
            let card = new Phaser.GameObjects.Sprite(
                this.scene, 
                this.scene.game.config.width * 0.91 + i * 1.5, 
                this.scene.game.config.height * 0.85 - i * 1.5, 
                'cover_purple').setScale(0.32);

            let opcard = new Phaser.GameObjects.Sprite(
                this.scene, 
                this.scene.game.config.width * 0.91 + i * 1.5, 
                this.scene.game.config.height * 0.15 - i * 1.5, 
                'cover_red').setScale(0.32);

            this.scene.add.existing(card);
            this.scene.add.existing(opcard);

            this.mydeckSprites.push(card);
            this.opdeckSprites.push(opcard);
        }
        
        this.mycards_amountText = new Phaser.GameObjects.Text(
            this.scene,
            this.mydeckSprites[0].x + 8,
            this.mydeckSprites[0].y - 120,
            this.mydeckSprites.length, fontConfig
        ).setOrigin(0.5)
        this.opcards_amountText = new Phaser.GameObjects.Text(
            this.scene,
            this.opdeckSprites[0].x + 8,
            this.opdeckSprites[0].y + 110,
            this.opdeckSprites.length, fontConfig
        ).setOrigin(0.5)
        this.scene.add.existing(this.mycards_amountText);
        this.scene.add.existing(this.opcards_amountText);
        this.mycards_amount = this.mydeckSprites.length;
        this.opcards_amount = this.opdeckSprites.length;
    }

    giveFromDeck(IsOp = null) {
        let card;
        if(IsOp) {
            card = this.opdeckSprites[this.opdeckSprites.length - 1];
            this.opdeckSprites.pop();
            this.opcards_amount--;
        }   
        else {
            card = this.mydeckSprites[this.mydeckSprites.length - 1];
            this.mydeckSprites.pop();
            this.mycards_amount--;
        }

        this.scene.tweens.add({
            targets: card,
            scaleX: 0,
            scaleY: 0,
            duration: 800,
            callbackScope: this,
            onComplete: () => {
                card.destroy();
            }
        })
        
    }
    
    dealCards(cardAmount) {
        this.scene.input.enabled = false;
        let last = null;
        for(let i = 0; i < cardAmount; i++) {
            let MyCard = new CardPlayable({
                scene: this.scene,
                x: this.scene.game.config.width / 2 - 60 * cardAmount + 60 + (i * 120),
                y: this.scene.game.config.height - 160,
                card: this.deck[i].name,
                health: this.deck[i].defense,
                attack: this.deck[i].attack,
                cost: this.deck[i].cost,
                ability: JSON.parse(this.deck[i].ability)
            });
            if(i == cardAmount - 1) last = MyCard;
            this.animateDealing(MyCard, {
                start_x: MyCard.x + 300,
                start_y: this.scene.game.config.height + 150,
                delay: i * 200
            }, last)
            setTimeout(() => {
                let OponentCard = new CardBase({
                    scene: this.scene,
                    x: this.scene.game.config.width / 2 - 60 * cardAmount + 60 + (i * 120),
                    y: 110,
                    card: 'cover_red',
                })
                this.animateDealing(OponentCard, {
                    start_x: OponentCard.x + 300,
                    start_y: -150,
                    delay: i * 200
                })
                this.scene.opHandGroup.add(OponentCard);
                
            }, 1);
            this.scene.handGroup.add(MyCard);
            }
            this.deck = this.deck.splice(cardAmount);
            console.log(this.deck);
            this.createDeck();
    }

    animateDealing(target, options, last = null) {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: target,
                x: {start: options.start_x, to: target.x},
                y: {start: options.start_y, to: target.y},
                ease: 'Back',
                duration: 1000,
                delay: options.delay,
                callbackScope: this,
                onStart: () => {
                    delay(350).then(() => {this.deal_sound.play();})
                },
                onComplete: () => {
                    if(target == last)
                        this.scene.input.enabled = true;
                    resolve();
                }
            })
        })
    }

    cardsOverflow(IsOpponent) {
        return IsOpponent ? this.scene.opHandGroup.getLength() >= this.maxCards
                          : this.scene.handGroup.getLength() >= this.maxCards;
    }

    giveCard(toOpponent = false, delay = null) {
        if(this.cardsOverflow(toOpponent)) return;
        delay = delay ? delay : 200;
        let group, y, coords, card;

        if(toOpponent) {
            if(!this.opdeckSprites.length) return;
            group = this.scene.opHandGroup;
            y = -150;
            coords = group.getLength() ? get_top_card_coords(group) : {
                x: this.scene.game.config.width / 2 - 120};

            card = new CardBase({
                scene: this.scene,
                x: coords.x + 120,
                y: 110,
                card: 'cover_red',
            })
            this.giveFromDeck(true);
        }
        else {
            if(this.deck.length < 1) return;
            group = this.scene.handGroup;
            y = this.scene.game.config.height + 150;
            coords = group.getLength() ? get_top_card_coords(group) : {
                x: this.scene.game.config.width / 2 - 120};

            card = new CardPlayable({
                scene: this.scene,
                x: coords.x + 120,
                y: this.scene.game.config.height - 160,
                card: this.deck[0].name,
                health: this.deck[0].defense,
                attack: this.deck[0].attack,
                cost: this.deck[0].cost,
                ability: JSON.parse(this.deck[0].ability)
            })

            this.deck.shift();
           
            this.giveFromDeck();
        }

        group.add(card);
        arrange_layers(this.scene, group);
        
        this.animateDealing(card, {
            start_x: card.x + 300,
            start_y: y,
            delay: delay
        }).then(() => {
            centerlize_cards(this.scene, group, true);
        })
    }

    set mycards_amount(amount) {
        this._mycards_amount = amount;
        this.mycards_amountText.text = this._mycards_amount;
    }
    set opcards_amount(amount) {
        this._opcards_amount = amount;
        this.opcards_amountText.text = this._opcards_amount;
    }

    get mycards_amount() {return this._mycards_amount;}
    get opcards_amount() {return this._opcards_amount;}
}

