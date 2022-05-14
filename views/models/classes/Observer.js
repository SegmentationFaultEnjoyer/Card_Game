import CardPlayable from "./CardPlayable.js";
import { 
    fade_out_background,
    emit_particle_blast,
    emit_particle_splash,
    shake,
    glow,
    coin_flip
 } from "../helpers/animations.js";
import { centerlize_cards, arrangeCardsInHand } from "../helpers/card_arrangment.js";
import { summon_card } from "../helpers/unit_helpers.js";
import { disable_interactions, restore_interactions } from "../helpers/movement_handlers.js";

export default class Observer {
    constructor(scene) {
        this.scene = scene;
        this.position = 0;
    }

    ShowDragStart(card) {
        return new Promise(resolve => {
            this.card = card;
            this.card.originalY = card.y;
            this.scene.tweens.add({
                targets: card,
                y: card.y + 50,
                duration: 200,
                callbackScope: this,
                onComplete: () => {
                    resolve();
                }
        })
        })
        
    }

    ShowDragEnd() {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this.card,
                y: this.card.originalY,
                duration: 200,
                callbackScope: this,
                onComplete: () => {
                    resolve();
                }
            })
        })
       
    }

    ShowCardDrop(card) {
        return new Promise(resolve => {
            let focus;
            let opcard = new CardPlayable({
                scene: this.scene,
                x: this.card.x,
                y: this.card.y,
                card: card.name,
                health: card.health,
                attack: card.attack,
                cost: card.cost,
                ability: card.ability
            });
            opcard.scaleX = 0;
            opcard.draggable = false;
            opcard.originalX = this.scene.game.config.width * 0.29 + this.position * 160;
            opcard.originalY = this.scene.game.config.height / 3;

            this.timeline = this.scene.tweens.createTimeline();

            this.timeline.add({
                targets: this.card,
                scaleX: 0,
                duration: 200});

            this.timeline.add({
                targets: opcard,
                scaleX: 0.77,
                scaleY: 0.77,
                duration: 200
            })    

            this.timeline.add({
                targets: opcard,
                x: this.scene.game.config.width * 0.2,
                y: this.scene.game.config.height / 2,
                scaleX: 2.5,
                scaleY: 2.5,
                duration: 300,
                delay: 100,
                callbackScope: this,
                onStart: () => {
                    focus = fade_out_background(this.scene, 
                        [...this.scene.children.list.filter(el => el != opcard)]);
                    arrangeCardsInHand(this.scene, this.scene.opHandGroup, this.card);
                    this.card.destroy(); 
                    this.scene.opBoardGroup.add(opcard);
                    opcard.sound.play();
                },
                onComplete: () => {
                    centerlize_cards(this.scene, this.scene.opHandGroup); 
                }
            })

            this.timeline.add({  //dropping
                targets: opcard,
                x: opcard.originalX,
                y: opcard.originalY,
                scaleX: 0.77,
                scaleY: 0.77,
                duration: 100,
                delay: 400,
                callbackScope: this,
                onStart: () => { focus.fade_back();},
                onComplete: () => {
                    this.scene.cameras.main.shake(200, 0.02);
                    this.scene.physics.world.enable(this.scene.opBoardGroup);
                    this.scene.manager.use_mana(opcard, true);
                    this.scene.boom.play();
                    resolve();
                }
            })

            this.timeline.play();
            this.position++;
            })
    }

    ShowTargetPick(source, targets, IsOpBoard) {
        return new Promise(resolve => {
            this.glowing = [];
            let picker = this.scene.opBoardGroup.getChildren()[source];
            targets = targets.map(el => el = 
                IsOpBoard ? this.scene.opBoardGroup.getChildren()[el]
                : this.scene.boardGroup.getChildren()[el]);
            
            disable_interactions(this.scene);

            this.focus = fade_out_background(this.scene, 
                [...this.scene.children.list.filter(el => el != picker && !targets.find(targ => targ == el))]);

            for(let target of targets) {
                this.glowing.push(glow(this.scene, target));
            }

            this.scene.physics.world.disable(this.scene.opBoardGroup);

            this.tween = this.scene.tweens.add({
                targets: picker,
                scaleX: 0.9,
                scaleY: 0.9,
                yoyo: true,
                duration: 300,
                repeat: -1
            })

            this.tween.on('stop', (tween, targets) => { 
                    this.scene.tweens.add({
                        targets: targets,
                        scaleX: 0.77,
                        scaleY: 0.77,
                        duration: 100,
                        callbackScope: this,
                        onComplete: () => {
                            this.scene.physics.world.enable(this.scene.opBoardGroup);
                        }
                    })
            })

            resolve();
        })
        
       
    }

    ShowTargetDepick() {
        return new Promise(resolve => {
            this.focus.fade_back();
            restore_interactions(this.scene);
            for(let item of this.glowing) {
                item.stop_glow();
            }
            this.tween.stop();
            resolve();
        })
    }

    ShowSummon(data, target_index) {
        return new Promise(resolve => {
            if(data.value == 0) {
                summon_card.call(this.scene.opBoardGroup.getChildren()[target_index], true);
            }
            else {
                summon_card.call(this.scene.opBoardGroup.getChildren()[target_index]);
            }
            resolve();
        })
    }

    ShowAttack(data, target_index) {
        return new Promise(resolve => {
            let target = this.scene.boardGroup.getChildren()[target_index[0]];
            let source = this.scene.opBoardGroup.getChildren()[target_index[1]];
            this.scene.sound.add('fireball').play();
            emit_particle_blast(this.scene, source.x, source.y, target.x, target.y)
                .then(() => {
                    shake(this.scene, target);
                    target.health -= data.value;
                    resolve();
                })
        })
        
    }

    ShowStrike(data) {
        return new Promise(resolve => {
            let mycard = this.scene.boardGroup.getChildren()[data.my_card];
            let opcard = this.scene.opBoardGroup.getChildren()[data.op_card];
            opcard.strike(mycard, true)
                .then(() => {
                    resolve();
                })
        })
    }

    ShowIgnoreDamage(target_index) {
        return new Promise(resolve => {
            let target = this.scene.opBoardGroup.getChildren()[target_index];
            target.shield_sound = this.scene.sound.add('shield');
            target.shield = true;
            resolve();
        })
    }

    ShowHeal(data, target_index) {
        return new Promise(resolve => {
            let target = this.scene.opBoardGroup.getChildren()[target_index];
            let heal_points = Math.min(data.value, target.initHealth - target.health);
            emit_particle_splash(this.scene, target.x, target.y, 'green');
            target.health += heal_points;
            this.scene.sound.add('heal').play();
            resolve();
        })
    }

    ShowTakeCard(amount) {
        return new Promise(resolve => {
            for(let i = 0; i < amount; i++) {
                this.scene.dealer.giveCard(true, 200 * (i + 1));
            }
            resolve();
        })
    }

    ShowBuff(data, target_index) {
        return new Promise(resolve => {
            let targets = [];
            let target = this.scene.opBoardGroup.getChildren()[target_index];
            if(data.spec == 'end_turn') {
                emit_particle_splash(this.scene, target.x, target.y, 'blue');
                target.health += data.value;
            } 
            else if(data.spec == 'on_drop') {
                if(data.target == 'all') 
                    targets = target_index.map(el => el = this.scene.opBoardGroup.getChildren()[el]);
                else 
                    targets.push(this.scene.opBoardGroup.getChildren()[target_index]);
                for(let target of targets) {
                    for(let stat of data.stats) {
                        target[stat] += data.value;
                        emit_particle_splash(this.scene, target.x, target.y, 'blue');
                    }
                }
            }
            this.scene.sound.add('buff').play();
            resolve();
        })  
    }

    ShowDestroy(target_index) {
        return new Promise(resolve => {
            let target = this.scene.boardGroup.getChildren()[target_index];
            target.health = 0;
            this.scene.sound.add("snap").play();
            resolve();
        })
    }

    ShowDissable(target_index) {
        return new Promise(resolve => {
            let target = this.scene.boardGroup.getChildren()[target_index];
            this.scene.manager.wait_for_strike(target);
            shake(this.scene, target);
            resolve();
        })
    }

    ShowCoinFlip() {
        return new Promise(resolve => {
            const COLOR_BAR = 0x000080;
            this.scene.manager.flip_sound.play();
            this.scene.manager.maxManaOp++;
            this.scene.manager.restore_mana(true);
            this.scene.manager.my_turn = true;
            coin_flip(this.scene, 'coin_on', 0.15);
            this.scene.manager.countdown_tween.stop();
            this.scene.manager.reset_coundown(COLOR_BAR);
            resolve();
        })
    }

    ShowManaStoneUse() {
        return new Promise(resolve => {
            let stone = this.scene.manager.mana_stone;
            shake(this.scene, stone);
            this.scene.tweens.add({
                targets: stone,
                alpha: 0,
                duration: 200,
                callbackScope: this,
                onStart: () => { this.scene.sound.add('mana').play();},
                onComplete: () => {
                    emit_particle_splash(this.scene, stone.x, stone.y, 'red');
                    this.scene.manager.op_mana++;
                    stone.destroy();
                    resolve();
                } 
            })
        })
    }
}