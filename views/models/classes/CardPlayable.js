import CardDraggable from "./CardDraggable.js";
import SuperPowers from './SuperPowers.js';
import { emit_particle_splash, fade_out_background, shake } from "../helpers/animations.js";
import { get_defl_coords } from "../helpers/math_helpers.js";
import { disable_interactions, restore_interactions } from "../helpers/movement_handlers.js";
import { arrangeCardsOnBoard } from "../helpers/card_arrangment.js";

export default class CardPlayable extends CardDraggable {
    constructor(data) {
        let {health, attack, cost, ability} = data;
        let fontConfig = {
            fontFamily: 'Arial',
            fontSize: '30px',
            stroke: 'black',
            strokeThickness: 3
        }
        super(data);
        this.textHealth = new Phaser.GameObjects.Text(
            this.scene, -76.5, -6, health, fontConfig
        )
        this.textAttack = new Phaser.GameObjects.Text(
            this.scene, -77, 89, attack, fontConfig
        );
        this.textCost = new Phaser.GameObjects.Text(
            this.scene, 57.5, 87.5, cost, fontConfig
        );
        this.add([this.textHealth, this.textAttack, this.textCost]);

        this.health = health;           this.initHealth = health;
        this.attack = attack;           this.initAttack = attack;
        this.cost = cost;               this.shield = false;
        this.ability = ability;
        this.sound = this.scene.sound.add(this.name + '_sound', {volume: 2});
       
        let powers = new SuperPowers(this.scene);
        powers.Builder(this, ability);

        this.on('pointerdown', this.show_preview);
    }

    set health(newHealth) {
        if(newHealth < this._health && this.shield) { //shield
            this.shield = false;
            this.shield_sound.play();
            emit_particle_splash(this.scene, this.x, this.y, 'white')
            return;
        }

        if(newHealth > 0) {
            this._health = newHealth;
            this.textHealth.text = this._health;

            if(this.spec == 'health_depend') {
                this.use_ability();
            }
            
            if(this.health < this.initHealth) 
                this.textHealth.setColor('red');
            else if(this.health > this.initHealth)
                this.textHealth.setColor('lime');
            else   
                this.textHealth.setColor('white');

            if(newHealth > 9) 
                this.textHealth.x = -86.5;
            else
                this.textHealth.x = -76.5;
        }
        else if(!(this.scene === undefined)) {
            this.spriteCard.setTint(0xff0000);
            this.scene.tweens.add({
                targets: this,
                alpha: {start: 1, to: 0},
                duration: 300,
                ease: 'back',
                callbackScope: this,
                onComplete: function() {
                    console.log('card dead');
                    if(this.IsOnBoard()) { //if my card dies
                        this.scene.zone.dropZone.data.values.cards--;
                        arrangeCardsOnBoard(this.scene, this.scene.boardGroup, this);
                    }
                    else {                    //if opponent card dies
                        this.scene.observer.position--;
                        arrangeCardsOnBoard(this.scene, this.scene.opBoardGroup, this);
                    }
                    this.destroy();
                }
            })
        }
        
    }
    set attack(newAttack) {
        this._attack = newAttack;
        this.textAttack.text = this._attack;
        if(this.attack < this.initAttack) 
            this.textAttack.setColor('red');
        else if(this.attack > this.initAttack)
            this.textAttack.setColor('lime');
        else   
            this.textAttack.setColor('white');
        
        if(newAttack > 9)
            this.textAttack.x = -87;
        else
            this.textAttack.x = -77;
    }
    set cost(newCost) {
        this._cost = newCost;
        this.textCost.text = this._cost;
    }

    get health() {return this._health;}
    get attack() {return this._attack;}
    get cost() {return this._cost;}

    show_preview(pointer, x, y, event) {
        if(pointer.rightButtonDown()) {
            event.stopPropagation();
            this.preview = this.copy_card(this).disableInteractive();
            disable_interactions(this.scene);
            this.focus = fade_out_background(this.scene, 
                [...this.scene.children.list.filter(el => el != this.preview)]);
            this.scene.tweens.add({
                targets: this.preview,
                scaleX: 2.5,
                scaleY: 2.5,
                x: this.scene.game.config.width * 0.75,
                y: this.scene.game.config.height / 2,
                duration: 300
            })

            this.scene.input.once('pointerdown', () => {
                this.focus.fade_back();
                this.scene.tweens.add({
                    targets: this.preview,
                    scaleX: 1,
                    scaleY: 1,
                    alpha: 0,
                    x: this.x,
                    y: this.y,
                    duration: 300,
                    callbackScope: this,
                    onComplete: () => {
                        restore_interactions(this.scene);
                        this.preview.destroy();
                    }
                })

            })
        }
    }

    copy_card(card) {
        let new_card = new CardPlayable({
            scene: card.scene,
            x: card.x,
            y: card.y,
            card: card.name,
            health: card.initHealth,
            attack: card.initAttack,
            cost: card.cost,
            ability: card.ability
        })
        new_card.health = card.health;
        new_card.attack = card.attack;
        return new_card;
    }

    IsOnBoard() {
        return this.scene.boardGroup.contains(this);
    }
    IsInHand() {
        return this.scene.handGroup.contains(this);
    }
    IsOnOpBoard() {
        return this.scene.opBoardGroup.contains(this);
    }

    GetIndex(group) {
        let cards = group.getChildren();
        for(let i = 0; i < group.getLength(); i++) {
            if(this === cards[i]) return i;
        }
        return null;
    }

    strike(card, reverse = null) {
        return new Promise(resolve => {
            let x, y, x_back, y_back, shift;
            if(reverse) {
                x = this.x;
                y = this.y;
                x_back = this.originalX;
                y_back = this.originalY;
                shift = 50;
            }
            else{
                x = this.originalX;
                y = this.originalY;
                x_back = x; y_back = y;
                shift = -50;
            }
            
            let deflection = get_defl_coords(card.x, card.y, x, y, shift);
            //this.scene.tween.stop();
            this.scene.children.bringToTop(this);

            let timeline = this.scene.tweens.createTimeline();
            timeline.add({  //getting ready
                targets: this,
                x:  deflection.x,
                y:  deflection.y,
                duration: 300,
                ease: 'Cubic',
                delay: 250
            });

            timeline.add({ //attacking
                targets: this,
                x: card.x,
                y: card.y,
                duration: 200,
                delay: 50,
                ease: 'Cubic',
                callbackScope: this,
                onComplete: () => {
                    if(!(this.scene.children === "undefined"))
                        this.scene.children.moveTo(this, 5);
                    this.scene.cameras.main.shake(160, 0.01);
                    this.scene.strike_sound.play();
                    if(card.health - this.attack > 0) 
                        emit_particle_splash(this.scene, card.x, card.y, 'yellow');
                    else 
                        emit_particle_splash(this.scene, card.x, card.y, 'red');
                    card.health -= this.attack;
                    this.health -= card.attack;
                    shake(this.scene, this);
                }
            })

            timeline.add({ //going back
                targets: this,
                x: x_back,
                y: y_back,
                duration: 200,
                ease: 'Cubic',
                callbackScope: this,
                onComplete: () => {
                    resolve();
                }
            })

            timeline.play();
            })
        
    }

    use_ability() {
        return; //placeholder
    }
}

