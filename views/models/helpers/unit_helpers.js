import { 
    disable_interactions, 
    restore_interactions 
} from "./movement_handlers.js";
import {fade_out_background, glow} from "./animations.js"
import CardPlayable from "../classes/CardPlayable.js";

function count_damaged_units() {
    let units = [...this.scene.boardGroup.getChildren(), ...this.scene.opBoardGroup.getChildren()];
    let amount = 0;
    for(let unit of units) {
        if(unit.health < unit.initHealth)
            amount++;
    }
    return amount;
}

function target_picker(possible_targets, IsMyBoard = false) {
    this.scene.network.PickingTarget(   //sending who picks, and who can be picked
        this.GetIndex(this.scene.boardGroup),
        possible_targets.map(el => el = el.GetIndex(
            IsMyBoard ? this.scene.boardGroup : this.scene.opBoardGroup)
            ),
        IsMyBoard
        );

    disable_interactions(this.scene, [...possible_targets]);
    let focus = fade_out_background(this.scene, 
        [...this.scene.children.list.filter(el => !possible_targets.find(targ => targ == el))]);
    
    return new Promise(resolve => { 
        let glowing;
        let callbacks = [];
        for(let target of possible_targets) {
            let g_call = () => { glowing = glow(this.scene, target);}
            let gn_call = () => { if(glowing) glowing.stop_glow();}
            callbacks.push({g: g_call, n: gn_call});

            target.draggable = false;

            target.on('pointerover', g_call);
            target.on('pointerout', gn_call);
            target.once('pointerdown', (pointer) => {
                if(pointer.leftButtonDown()) {
                    focus.fade_back();
                    target.emit('pointerout'); //removing hover effects
                    for(let i = 0; i < possible_targets.length; i++) {
                        possible_targets[i].off('pointerover', callbacks[i].g);
                        possible_targets[i].off('pointerout', callbacks[i].n);
                        if(IsMyBoard) possible_targets[i].draggable = true;
                    }
                    restore_interactions(this.scene);
                    target.dropped = false;
                    this.scene.network.TargetPicked();
                    resolve(target)
                }
               
            })
        }
        
    });
}

function summon_card(ToOpponent = null) {
    let card;
    if(this.scene) this.scene.sound.add('summon').play();
    if(ToOpponent) {
        card = new CardPlayable({
            scene: this.scene,
            x: this.scene.game.config.width * 0.29 + this.scene.observer.position * 160,
            y: this.scene.game.config.height / 3,
            card: this.name,
            health: this.health,
            attack: this.attack,
            cost: this.cost,
            ability: this.ability
        })
        card.draggable = false;
        this.scene.observer.position++;

        this.scene.opBoardGroup.add(card);
        this.scene.physics.world.enable(this.scene.opBoardGroup);
    }
    else {
        this.scene.zone.dropZone.data.values.cards++;
        card = new CardPlayable({
            scene: this.scene,
            x: (this.scene.zone.dropZone.x - 560) + (this.scene.zone.dropZone.data.values.cards * 160),
            y: this.scene.zone.dropZone.y,
            card: this.name,
            health: this.health,
            attack: this.attack,
            cost: this.cost,
            ability: this.ability
        })
        card.scaleX = 1; 
        card.scaleY = 1;
        this.scene.boardGroup.add(card);
        this.scene.physics.world.enable(this.scene.boardGroup);
        this.scene.manager.wait_for_strike(card);
        this.scene.manager.add_attack_handler(card);
    }
    
    card.alpha = 0;
    this.scene.tweens.add({
        targets: card,
        alpha: 1,
        scaleX: 0.77,
        scaleY: 0.77,
        duration: 200
    })
 
}

export {
    count_damaged_units, 
    target_picker,
    summon_card
}