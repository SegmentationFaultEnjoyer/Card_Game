import {  
    emit_particle_blast,
    emit_particle_splash,
    shake
} from "../helpers/animations.js";
import { 
    target_picker, 
    count_damaged_units,
    summon_card
} from "../helpers/unit_helpers.js";


export default class SuperPowers {
    constructor(scene) {
        this.scene = scene;
    }

    Builder(card, ability_info) { //{key: 'damage', value: '3', options: {}, spec: 'end_turn'}
        switch(ability_info.key) {
            case 'damage':
                card.use_ability = this.Damage.call(card, ability_info.value);
                card.spec = ability_info.spec; //'on_drop'
                break;

            case 'ignore_damage':
                card.use_ability = this.IgnoreDamage.call(card);
                card.spec = ability_info.spec; // 'on_drop'
                break;

            case 'heal':
                card.use_ability = this.Heal.call(card, ability_info.value);
                card.spec = ability_info.spec; // 'on_drop'
                break;

            case 'take_card':                          
                card.use_ability = this.TakeCard.call(card, ability_info.value);
                card.spec = ability_info.spec; // 'on_drop'
                break;
            case 'strike':
                if(ability_info.spec == 'end_turn') {
                    card.use_ability = this.EndTurnStrike.call(card);
                    card.spec = ability_info.spec; // 'end_turn'
                }
                break;

            case 'buff':
                if(ability_info.spec == 'on_drop') {
                    card.use_ability = this.Buff.call(card, ability_info.value, {
                        target: ability_info.target,
                        stats: ability_info.stats
                    });
                    card.spec = ability_info.spec; // 'on_drop'
                }
                else if(ability_info.spec == 'health_depend') {
                    card.use_ability = this.OnLowHealth.call(card, ability_info.value, 'buff');
                    card.spec = ability_info.spec; // 'health_depend'
                }
                else { 
                    card.use_ability = this.EndTurnBuff.call(card, ability_info.value);
                    card.spec = ability_info.spec; // 'end_turn'
                }
                break;

            case 'debuff':
                if(ability_info.spec == 'health_depend') {
                    card.use_ability = this.OnLowHealth.call(card, ability_info.value, 'debuff');
                    card.spec = ability_info.spec; // 'health_depend'
                }
                break;

            case 'dissable':
                card.use_ability = this.DissableCard.call(card);
                card.spec = ability_info.spec; // 'on_drop'
                break;

            case 'summon':
                card.use_ability = this.SummonCopy.call(card, ability_info.value);
                card.spec = ability_info.spec; // 'on_drop'
                break;
            
            case 'double_attack':
                card.use_ability = this.DoubleAttack.call(card);
                card.spec = ability_info.spec; // 'on_drop'
                break;

            case 'destroy':
                card.use_ability = this.Destroy.call(card);
                card.spec = ability_info.spec; // 'on_drop'
                break;
            
            default:
                break;
            
        }
    } 
    
    Damage(damage_amount) {
        return async () => {
            if(this.scene.opBoardGroup.getLength() < 1) return;

            let sound = this.scene.sound.add('fireball');
            let target = await target_picker.call(this, this.scene.opBoardGroup.getChildren());
            sound.play();

            this.scene.network.UseAbility(this.ability, 
                [target.GetIndex(this.scene.opBoardGroup), this.GetIndex(this.scene.boardGroup)]);

            let res = await emit_particle_blast(this.scene, this.x, this.y, target.x, target.y);
            shake(this.scene, target);
            target.health -= damage_amount;
        }
    }

    IgnoreDamage() { //captain america
        return () => {
            this.shield = true;
            this.shield_sound = this.scene.sound.add('shield');
            this.scene.network.UseAbility(this.ability, this.GetIndex(this.scene.boardGroup));
        }
    }

    Heal(hp) {
        return async () => {
            if(this.scene.boardGroup.getLength() < 2) return;

            let target = await target_picker.call(this,  
                this.scene.boardGroup.getChildren()
                .filter(el => el != this), true);
            let heal_points = Math.min(hp, target.initHealth - target.health);
            emit_particle_splash(this.scene, target.x, target.y, 'green');
            this.scene.sound.add('heal').play();
            target.health += heal_points;

            this.scene.network.UseAbility(this.ability, target.GetIndex(this.scene.boardGroup));
        }
    }

    TakeCard(amount = null) { //without amount - drax
        return () => {
            amount = amount ? amount : count_damaged_units.call(this);
            for(let i = 0; i < amount; i++) {
                this.scene.dealer.giveCard(false, 200 * (i + 1));
            }
           
            this.scene.network.UseAbility(this.ability, amount);
        }
    }

    EndTurnStrike() {  //Dr.Strange ; need to be add to the queue in manager
        return () => {
            if(this.scene.opBoardGroup.getLength() < 1) return;

            let index = Phaser.Math.Between(0, this.scene.opBoardGroup.getLength() - 1);
            let target =  this.scene.opBoardGroup.getChildren()[index];
            
            this.scene.network.CardAttacked({
                my_card: target.GetIndex(this.scene.opBoardGroup), 
                op_card: this.GetIndex(this.scene.boardGroup)
            })
            this.strike(target);
        }
    }

    EndTurnBuff(points) {
        return () => {
            this.health += points;
            emit_particle_splash(this.scene, this.x, this.y, 'blue');
            this.scene.sound.add('buff').play();
            this.scene.network.UseAbility(this.ability, this.GetIndex(this.scene.boardGroup));
        }
    }

    Buff(points, options) { //options = {target: pick / all, stats: [attack / health]}
        return async () => {          //Gamora and Scarlett
            if(this.scene.boardGroup.getLength() < 2) return;
            
            let targets = [];
            switch(options.target) {
                case 'pick':
                    let target = await target_picker.call(this, 
                        this.scene.boardGroup.getChildren()
                        .filter(el => el != this), true);
                    targets.push(target);
                    this.scene.network.UseAbility(this.ability, target.GetIndex(this.scene.boardGroup));
                    target.dropped = false;
                    break;
                case 'all':
                    targets = [...this.scene.boardGroup.getChildren()
                        .filter(el => el != this)];
                        this.scene.network.UseAbility(this.ability, targets.map(
                            el => el = el.GetIndex(this.scene.boardGroup)
                        ));
                    break;
                default:
                    break;
            }
            for(let target of targets) {
                for(let stat of options.stats) {
                    target[stat] += points;
                    emit_particle_splash(this.scene, target.x, target.y, 'blue');
                }
            }
            this.scene.sound.add('buff').play();
            
        }
    }

    OnLowHealth(points, ability) { //ability = buff / debuff; spec: 'health_depend'
        switch(ability) {
            case 'buff':
                return () => {
                    if(this.health < this.initHealth && this.attack == this.initAttack)
                        this.attack = this.attack + points;
                    else if(this.health == this.initHealth)
                        this.attack = this.initAttack;
                    this.scene.network.UseAbility(this.ability, this.GetIndex(this.scene.boardGroup));
                }
            case 'debuff':
                return () => {
                    if(this.health < this.initHealth && this.attack == this.initAttack)
                        this.attack = this.attack - points;
                    else if(this.health == this.initHealth)
                        this.attack = this.initAttack;
                    this.scene.network.UseAbility(this.ability, this.GetIndex(this.scene.boardGroup));
                }
            default:
                return null;
        }
        
        
    } 

    DissableCard() {  //need to be tested online
        return async () => {
            if(this.scene.opBoardGroup.getLength() < 1) return;

            let target = await target_picker.call(this, this.scene.opBoardGroup.getChildren());
            shake(this.scene, target);
            this.scene.network.UseAbility(this.ability, target.GetIndex(this.scene.opBoardGroup));
        }
    }

    SummonCopy(table) {
        switch(table) {
            case 0: //my tabble
                return () => {
                    if(this.scene.boardGroup.getLength() < 5) {
                        this.scene.network.UseAbility(this.ability, this.GetIndex(this.scene.boardGroup));
                        summon_card.call(this);
                    }
                }
            case 1: //op tabble
                return () => {
                    if(this.scene.opBoardGroup.getLength() < 6) {
                        this.scene.network.UseAbility(this.ability, this.GetIndex(this.scene.boardGroup));
                        summon_card.call(this, true);
                    }
                }
            default:
                return null;
        }
    }

    DoubleAttack() {
        return () => {
            this.double_attack = true;
        }
    }

    Destroy() {
        return async () => {
            if(this.scene.opBoardGroup.getLength() < 1) return;

            let target = await target_picker.call(this, this.scene.opBoardGroup.getChildren());
            this.scene.sound.add("snap").play();
            this.scene.network.UseAbility(this.ability, target.GetIndex(this.scene.opBoardGroup));
            target.health = 0;
        }
    }
}

