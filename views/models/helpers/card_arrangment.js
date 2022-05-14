import {restore_interactions } from "./movement_handlers.js";

function IsOnTop(group, card) {
    let cards = group.getChildren();
    return card == cards[cards.length - 1];
}

function get_top_card_coords(group) {
    let cards = group.getChildren();
    return {
        x: cards[cards.length - 1].x,
        y: cards[cards.length - 1].y
    }
}

function get_top_card(group) {
    let cards = group.getChildren();
    return cards[cards.length - 1];
}

function arrangeCardsInHand(scene, group, picked_card) {
    return new Promise(resolve => {
        let need_shift = false;
        let cards = group.getChildren();
        for(let card of cards) {
            if(card == picked_card) {
                need_shift = true;
                continue;
            }
            if(need_shift) {
                scene.tweens.add({
                    targets: card,
                    x: card.x - 120,
                    duration: 100,
                    callbackScope: scene,
                    onComplete: () => {
                        if(card == cards[cards.length - 1])
                            resolve();
                    }
                })
            }  
        }
    })
    
}

function arrangeCardsOnBoard(scene, group, dead_card) {
    let need_shift = false;
    let cards = group.getChildren();
    if(!IsOnTop(group, dead_card)) {
        for(let card of cards) {
            if(card == dead_card) {
                need_shift = true;
                continue;
            }
            if(need_shift) {
                scene.tweens.add({
                    targets: card,
                    x: card.x - 160,
                    duration: 100,
                    callbackScope: this,
                    onComplete: () => {
                        card.originalX -= 160;
                    }
                })
            }  
        }
    }
}

function centerlize_cards(scene, group, left = null) {
    return new Promise(resolve => {
        let cards = group.getChildren();
        for(let card of cards) {
            let x = left ? card.x - 60 : card.x + 60;
            scene.tweens.add({
                targets: card,
                x: x,
                duration: 100,
                callbackScope: scene,
                onComplete: () => {
                    if(card == cards[cards.length - 1])
                        resolve();
                }
            })
        }
        if(cards.length == 0)
            resolve();
    })
}

function arrange_layers(scene, group) {
    let cards = group.getChildren();
    for(let i = 0; i < cards.length; i++) {
        scene.children.bringToTop(cards[i]);
    }
}

function return_to_hand(scene, card) {
    return new Promise(resolve => {
        let coords = scene.handGroup.getLength() > 0 ? get_top_card_coords(scene.handGroup) : {
            x: card.input.dragStartX - 120, 
            y: card.input.dragStartY
        };
        scene.tweens.add({
            targets: card,
            x: coords.x + 120,
            y: coords.y,
            duration: 250,
            callbackScope: scene,
            onComplete: () => {
                card.dropped = false;
                resolve();
            }
        })
    })
}

function drop_card(scene, card, dropZone) {
    return new Promise(resolve => {
        dropZone.data.values.cards++;
        scene.tweens.add({
            targets: card,
            x: (dropZone.x - 560) + (dropZone.data.values.cards * 160),
            y: dropZone.y,
            scaleX: 0.77,
            scaleY: 0.77,
            duration: 100,
            callbackScope: scene,
            onStart: () => {card.sound.play();},
            onComplete: function(){
                scene.boom.play();
                scene.cameras.main.shake(200, 0.02); 
                scene.manager.add_attack_handler(card);
                card.originalX = card.x;
                card.originalY = card.y;
                scene.network.CardPlayed(card);
                restore_interactions(scene);
                card.dropped = false;  //??
                resolve();
            }
        })
    })
}

export {
    IsOnTop,
    get_top_card_coords,
    get_top_card,
    arrangeCardsInHand,
    arrangeCardsOnBoard,
    arrange_layers,
    centerlize_cards,
    return_to_hand,
    drop_card
};