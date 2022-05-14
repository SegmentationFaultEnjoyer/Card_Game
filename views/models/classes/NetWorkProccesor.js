import ActionQueue from "./ActionQueue.js";

export default class NetWork{
    constructor(data) {
        let {scene, socket, room} = data;
        this.scene = scene;
        this.socket = socket;
        this.room = room;
        this.queue = new ActionQueue();

        socket.on("drag_start", this.DragStartHandler.bind(this));
        socket.on("drag_end", this.DragEndHandler.bind(this));
        socket.on("card_played", this.DropHandler.bind(this));
        socket.on("change_turn", this.TurnHandler.bind(this));
        socket.on("card_attacked", this.AttackHandler.bind(this));
        socket.on("ability_use", this.AbilityHandler.bind(this));
        socket.on("target_pick", this.TargetPickerHandler.bind(this));
        socket.on("target_picked", this.TargetDepickHandler.bind(this));
        socket.on("mana_stone", this.ManaStoneHandler.bind(this));
        socket.on("game_over", this.GameEndHandler.bind(this));
    }

    StartDragging(index) {
        this.socket.emit("drag_start", index, this.room);
    }

    EndDragging() {
        this.socket.emit("drag_end", this.room);
    }

    CardPlayed(card) {
        this.socket.emit("card_played", {
            name: card.name,
            health: card.health,
            attack: card.attack,
            cost: card.cost,
            ability: card.ability
        }, this.room);
    }

    CardAttacked(data) {  //my_card; op_card
        this.socket.emit("card_attacked", data, this.room);
    }

    TurnFinished() {
        this.socket.emit("change_turn", this.room);
    }

    PickingTarget(source, targets, IsMyBoard) {
        this.socket.emit("target_pick", source, targets, IsMyBoard, this.room);  
    }

    TargetPicked() {
        this.socket.emit("target_picked", this.room);  
    }

    UseAbility(ability_info, target) {
        this.socket.emit("ability_use", ability_info, target, this.room);        
    }

    ManaStoneUsed() {
        this.socket.emit("mana_stone", this.room);
    }

    GameOver() {
        this.socket.emit("game_over", this.room);
    }
    
    //==================================================================== 

    ManaStoneHandler() {
        this.queue.add({
            func: this.scene.observer.ShowManaStoneUse.bind(this.scene.observer),
            params: []
        })
    }

    TurnHandler() {
        this.queue.add({
            func: this.scene.observer.ShowCoinFlip.bind(this.scene.observer),
            params: []
        })        
    }

    DragStartHandler(index) {
        this.queue.add({
            func: this.scene.observer.ShowDragStart.bind(this.scene.observer),
            params: [this.scene.opHandGroup.getChildren()[index]]
        }) 
    }

    DragEndHandler() {
        this.queue.add({
            func: this.scene.observer.ShowDragEnd.bind(this.scene.observer),
            params: []
        })      
    }

    DropHandler(data) {
       this.queue.add({
           func: this.scene.observer.ShowCardDrop.bind(this.scene.observer),
           params: [data]
       })     
    }

    AttackHandler(data) {  //my_card; op_card
       this.queue.add({
           func: this.scene.observer.ShowStrike.bind(this.scene.observer),
           params: [data]
       })            
    }

    TargetPickerHandler(source, targets, IsMyBoard) {
        this.queue.add({
            func: this.scene.observer.ShowTargetPick.bind(this.scene.observer),
            params: [source, targets, IsMyBoard]
        })   
    }

    TargetDepickHandler() {
       this.queue.add({
           func: this.scene.observer.ShowTargetDepick.bind(this.scene.observer),
           params: []
       })  
    }

    AbilityHandler(data, target_index) { //data = {key: 'ability_name', target: card_index, table: 0 / 1}
                                //0 - my tabble; 1 - not mine
        console.log(data, target_index);
        switch(data.key) {
            case 'dissable':
                this.queue.add({
                    func: this.scene.observer.ShowDissable.bind(this.scene.observer),
                    params: [target_index]
                })
                break;
            case 'summon':
                this.queue.add({
                    func: this.scene.observer.ShowSummon.bind(this.scene.observer),
                    params: [data, target_index]
                })
                break;
            case 'damage':
                this.queue.add({
                    func: this.scene.observer.ShowAttack.bind(this.scene.observer),
                    params: [data, target_index]
                })
                break;
            case 'ignore_damage':
                this.queue.add({
                    func: this.scene.observer.ShowIgnoreDamage.bind(this.scene.observer),
                    params: [target_index]
                })
                break;
            case 'heal':
                this.queue.add({
                    func: this.scene.observer.ShowHeal.bind(this.scene.observer),
                    params: [data, target_index]
                })
                break;
            case 'take_card':
                this.queue.add({
                    func: this.scene.observer.ShowTakeCard.bind(this.scene.observer),
                    params: [target_index]
                })
                break;
            case 'buff':
                this.queue.add({
                    func: this.scene.observer.ShowBuff.bind(this.scene.observer),
                    params: [data, target_index]
                })
                break;
            case 'destroy':
                this.queue.add({
                    func: this.scene.observer.ShowDestroy.bind(this.scene.observer),
                    params: [target_index]
                })
                break;
            default:
                return;
        }
    }

    GameEndHandler() {
        console.log("YOU WIN");
        this.scene.manager.show_end_game(true);
    }
}