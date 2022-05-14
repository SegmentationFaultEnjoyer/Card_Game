export default class Zone {
    constructor(scene) {
        this.scene = scene;
    }
    renderZone(data) {
        let {x, y, width, height} = data;
        this.dropZone = this.scene.add.zone(x, y, width, height)
            .setRectangleDropZone(width, height);
        this.dropZone.setData({ cards: 0 });
    };
    renderOutline(){
        this.outline_borders = [
            this.dropZone.x - this.dropZone.input.hitArea.width / 2, 
            this.dropZone.y - this.dropZone.input.hitArea.height / 2, 
            this.dropZone.input.hitArea.width, this.dropZone.input.hitArea.height
        ];
        this.dropZoneOutline = this.scene.add.graphics();
        // this.dropZoneOutline.lineStyle(4, 0xff69b4);
        // this.dropZoneOutline.strokeRect(...this.outline_borders);

        this.scene.input.on('dragenter', this.in_zone_handler, this);
        this.scene.input.on('dragleave', this.out_of_zone_handler, this);
        this.scene.input.on('drop', this.out_of_zone_handler, this);
    }

    out_of_zone_handler(pointer, card) {
        if(!card.IsOnBoard() && this.scene.manager.check_step_ability(card)){
            this.dropZoneOutline.clear();
            // this.dropZoneOutline.lineStyle(4, 0xff69b4);
            // this.dropZoneOutline.strokeRect(...this.outline_borders);
        }
    }

    in_zone_handler(pointer, card) {
        if(!card.IsOnBoard() && this.scene.manager.check_step_ability(card)){
            this.dropZoneOutline.clear();
            this.dropZoneOutline.lineStyle(4, 0x00ffff);
            this.dropZoneOutline.strokeRect(...this.outline_borders);
        }
    }
    
}