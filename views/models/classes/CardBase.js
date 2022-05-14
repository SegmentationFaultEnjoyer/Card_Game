
export default class CardBase extends Phaser.GameObjects.Container {
    constructor(data) {
        let {scene, x, y, card} = data;
        let spriteCard = new Phaser.GameObjects.Sprite(scene, 0, 0, card).setScale(0.3);
        spriteCard.width *= 0.3;
        spriteCard.height *= 0.3;
        super(scene, x, y, [spriteCard]);
        this.spriteCard = spriteCard;
        this.scene = scene;
        this.scene_layer_position = scene.children.list.length - 1;
        this.name = card;
        this.scene.add.existing(this);
    }
    update_position(index = null) {
        if(index)
            this.scene_layer_position = index;
        else
            this.scene_layer_position = this.scene.handGroup.getChildren()[this.scene.handGroup.getLength() - 1].scene_layer_position + 1;
    }
}