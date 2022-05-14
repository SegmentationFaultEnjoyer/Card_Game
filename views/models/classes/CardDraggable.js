import CardBase from './CardBase.js';
import {
    IsOnTop
} from "../helpers/card_arrangment.js";

export default class CardDraggable extends CardBase {
    constructor(data) {
        super(data);
        this.originalX = this.x;
        this.originalY = this.y;
        this.draggable = true;
        this.dragging = false;
        this.setSize(this.spriteCard.width, this.spriteCard.height);
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.on('pointerover', this.hover_in_handler, this);
        this.on('pointerout', this.hover_out_handler, this);
    }
 
    hover_in_handler() {
        if(!this.draggable) return;
        if(!this.IsOnBoard()) {
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.35,
                scaleY: 1.35,
                ease: 'Elastic',
                duration: 100
            })
            if(!IsOnTop(this.scene.handGroup, this))
               this.scene.children.moveUp(this);
        }
        else{
            this.scene.tweens.add({
                targets: this,
                scaleX: 1,
                scaleY: 1,
                ease: 'Elastic',
                duration: 100
            })
        }
    }

    hover_out_handler() {
        if(!this.draggable) return;
        if(!this.IsOnBoard()) {
            this.scene.tweens.add({
                targets: this,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            })
            if(!IsOnTop(this.scene.handGroup, this))
                this.scene.children.moveDown(this);
        }
        else{
            this.scene.tweens.add({
                targets: this,
                scaleX: 0.77,
                scaleY: 0.77,
                duration: 100
            })
        } 
    }
}