import { 
    IsOnTop, 
    return_to_hand, 
    drop_card,
    arrangeCardsInHand,
    arrange_layers,
    centerlize_cards
} from "./card_arrangment.js";
import { fade_out_background, shift_to_pointer } from "./animations.js";


const drag_start_handler = function (pointer, card) {
    if(card.IsInHand() && this.manager.check_step_ability(card)) { //picking card from hand
        this.focus = fade_out_background(this, [this.background, this.coin]);
        card.dragging = true;

        this.action_queue.add({
            func: shift_to_pointer,
            params: [this, card, pointer]
        })
        
        if(!IsOnTop(this.handGroup, card))
            this.action_queue.add({
                func: arrangeCardsInHand,
                params: [this, this.handGroup, card]
            })
        this.network.StartDragging(card.GetIndex(this.handGroup));
        this.action_queue.add({
            func: (scene, card) => {
                return new Promise(resolve => {
                    scene.handGroup.remove(card);
                    resolve();
                })
            },
            params: [this, card]
        })
        this.children.bringToTop(card);
    }
    else if(card.IsOnBoard() && this.manager.check_strike_ability(card)) { //picking card from board
        this.focus = fade_out_background(this, [this.background, this.coin]);
        card.dragging = true;
        card.dropped = false;
        this.children.bringToTop(card);
    }
}

const drag_move_handler = function (pointer, card, dragX, dragY) {
    if(this.manager.check_step_ability(card) && !card.IsOnBoard() ||
     this.manager.check_strike_ability(card) && card.IsOnBoard()) {
        card.x = pointer.x;
        card.y = pointer.y;
    }
};

const drag_end_handler = function (pointer, card, dropped) {
    if(!card.IsOnBoard() && !dropped && card.dragging && this.manager.check_step_ability(card)) {
        card.dragging = false;
        
        this.action_queue.add({
            func: return_to_hand,
            params: [this, card]
        })

        this.action_queue.add({
            func: (scene, card, arrange) => {
                return new Promise(resolve => {
                    scene.handGroup.add(card);
                    arrange(scene, scene.handGroup);
                    restore_interactions(scene);
                    resolve();
                })
            },
            params: [this, card, arrange_layers]
        })
        this.focus.fade_back();

        this.network.EndDragging();
    }
    else if(card.IsOnBoard() && card.dragging) {
        card.dragging = false;
        this.tween = this.tweens.add({
            targets: card,
            x: card.input.dragStartX,
            y: card.input.dragStartY,
            duration: 250,
            callbackScope: this,
            onComplete: () => {
                card.dropped = false;
            }
        })
        this.children.moveTo(card, 5);
        this.focus.fade_back();
    }
    
}

const drop_handler = function(pointer, card, dropZone) {
    if(!card.IsOnBoard() && this.manager.check_step_ability(card)) {
        card.dragging = false;

        this.children.moveTo(card, 5);
        this.boardGroup.add(card);

        this.manager.use_mana(card);
        this.manager.wait_for_strike(card);
        card.scaleX = 1; 
        card.scaleY = 1;
        this.physics.world.enable(this.boardGroup); 
        
        this.action_queue.add({
            func: drop_card,
            params: [this, card, dropZone]
        })

        this.action_queue.add({
            func: centerlize_cards,
            params: [this, this.handGroup]
        })

        this.action_queue.add({
            func: (scene, card) => {
                return new Promise(resolve => {
                    if(card.ability.spec == 'on_drop')
                        card.use_ability();
                    else if(card.ability.spec == 'end_turn')
                        scene.manager.wait_for_ability(card);
                    resolve();
                })
            },
            params: [this, card]
        })

       this.focus.fade_back();
    } 
}

function disable_interactions(scene, exclude = null) {
    if(scene.handGroup.getLength() > 0)
        scene.handGroup.children.iterate(el => {el.disableInteractive()});
    if(scene.opBoardGroup.getLength() > 0)
        scene.opBoardGroup.children.iterate(el => {
            if(exclude && !exclude.find(targ => targ == el) || !exclude)
                el.disableInteractive()
        });
    if(scene.boardGroup.getLength() > 0)
        scene.boardGroup.children.iterate(el => {
            if(exclude && !exclude.find(targ => targ == el) || !exclude)
                el.disableInteractive();
        });
    scene.coin.disableInteractive();
}

function restore_interactions(scene) {
    if(scene.handGroup.getLength() > 0)
        scene.handGroup.children.iterate(el => {el.setInteractive()});
    if(scene.boardGroup.getLength() > 0)
        scene.boardGroup.children.iterate(el => {el.setInteractive()});
    if(scene.opBoardGroup.getLength() > 0)
        scene.opBoardGroup.children.iterate(el => {el.setInteractive()});
    scene.coin.setInteractive();
}

export {
    drag_start_handler,
    drag_move_handler,
    drag_end_handler,
    drop_handler,
    disable_interactions,
    restore_interactions
};