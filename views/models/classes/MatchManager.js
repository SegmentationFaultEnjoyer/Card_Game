import {
    drag_start_handler,
    drag_move_handler,
    drag_end_handler,
    drop_handler,
    disable_interactions,
    restore_interactions
} from '../helpers/movement_handlers.js';
import { 
    coin_flip, 
    fade_out_background,
    particle_text,
    glow,
    shake,
    emit_particle_splash
 } from '../helpers/animations.js';

export default class MatchManager { 
    constructor(data) {
        let {scene, IsMyTurn, mana, maxMana} = data;
        
        let coin_sprite = IsMyTurn ? 'coin_on' : 'coin_off'; //adding coin depending on which turn
        let scale = IsMyTurn ? 0.15 : 0.235;        
        scene.coin = scene.add.rexTransitionImage(
            scene.game.config.width * 0.92, 
            scene.game.config.height / 2, coin_sprite, 
            {duration: 200})
            .setScale(scale, scale)
            .setInteractive();

        let fontConfig =  {
            fontFamily: 'Arial',
            fontSize: '60px',
            stroke: 'black',
            strokeThickness: 5
        }
       
        this.textMana = new Phaser.GameObjects.Text( //my mana
            scene, scene.game.config.width * 0.88, 
            scene.game.config.height * 0.62,
            mana.my, fontConfig);
        this.delim = new Phaser.GameObjects.Text(
            scene, scene.game.config.width * 0.9, 
            scene.game.config.height * 0.62,
            '/', fontConfig);
        this.textMaxMana = new Phaser.GameObjects.Text(
            scene, scene.game.config.width * 0.91, 
            scene.game.config.height * 0.62,
            maxMana, fontConfig);

        this.textManaOp = new Phaser.GameObjects.Text( //opponent mana
            scene, scene.game.config.width * 0.88, 
            scene.game.config.height * 0.295,
            mana.op, fontConfig);
        this.delimOp = new Phaser.GameObjects.Text(
            scene, scene.game.config.width * 0.9, 
            scene.game.config.height * 0.295,
            '/', fontConfig);
        this.textMaxManaOp = new Phaser.GameObjects.Text(
                scene, scene.game.config.width * 0.91, 
                scene.game.config.height * 0.295,
                maxMana, fontConfig);

        scene.add.existing(this.textMana);
        scene.add.existing(this.textMaxMana);
        scene.add.existing(this.delim);
        scene.add.existing(this.textManaOp);
        scene.add.existing(this.textMaxManaOp);
        scene.add.existing(this.delimOp);

        this.scene = scene;
        this.my_turn = IsMyTurn;
        this.maxMana = maxMana;
        this.maxManaOp = maxMana;
        this.my_mana = mana.my;
        this.op_mana = mana.op;
        
        scene.coin.on('pointerup', this.coin_flip_handler, scene);
        scene.input.keyboard.addKey('SPACE').on('up', this.coin_flip_handler, scene);
        scene.input.on('dragstart', drag_start_handler, this.scene);
        scene.input.on('drag', drag_move_handler, this.scene);
        scene.input.on('dragend', drag_end_handler, this.scene);
        scene.input.on('drop', drop_handler, this.scene);

        scene.input.keyboard.addKey('ESC').on('up', this.surrender_menu, this);

        scene.physics.add.overlap(scene.boardGroup, scene.opBoardGroup, this.overlap_handler, null, this);

        this.waiting_cards = [];
        this.striking_cards = [];
        this.cards_with_end_turn_abilities = [];

        this.attack_counter = 0;
        this.turn_counter = 0;

        if(this.my_turn) 
            this.create_mana_stone(true);
        else
            this.create_mana_stone();

        this.flip_sound = this.scene.sound.add('flip');
        this.create_countdown();
        this.start_countdown();
    }

    position_setter(key, value) {
        let targets = null;
        switch(key) {
            case 'my_mana':
                targets = [this.textMana]
            case 'op_mana':
                targets = targets ?? [this.textManaOp];
                if(value <= 9 && this.maxMana > 9) {
                    targets[0].x = this.scene.game.config.width * 0.883;
                }
                else if(value > 9) {
                    targets[0].x = this.scene.game.config.width * 0.87;
                }
                break;
            case 'my_max_mana':
                targets = [this.textMaxMana, this.textMana, this.delim];
            case 'op_max_mana':
                targets = targets ?? [this.textMaxManaOp, this.textManaOp, this.delimOp];
                if(value <= 9) {
                    targets[0].x = this.scene.game.config.width * 0.92;
                    targets[1].x = this.scene.game.config.width * 0.888;
                    targets[2].x = this.scene.game.config.width * 0.908;
                }
                else {
                    targets[0].x = this.scene.game.config.width * 0.915;
                    targets[2].x = this.scene.game.config.width * 0.905;
                }
                break;
        }
    }

    set my_mana(newMana) {
        if(newMana <= 5 && newMana >= 0) {
            this._my_mana = newMana;
            this.textMana.text = this._my_mana;
            this.position_setter('my_mana', newMana);
        }
        
    }
    set op_mana(newMana) {
        if(newMana <= 5  && newMana >= 0) {
            this._op_mana = newMana;
            this.textManaOp.text = this._op_mana;
            this.position_setter('op_mana', newMana);
        }
        
    }
    set maxMana(newMana) {
        if(newMana <= 5) {
            this._maxMana = newMana;
            this.textMaxMana.text = this._maxMana;
            this.position_setter('my_max_mana', newMana);
        }
    }
    set maxManaOp(newMana) {
        if(newMana <= 5) {
            this._maxManaOp = newMana;
            this.textMaxManaOp.text = this._maxManaOp;
            this.position_setter('op_max_mana', newMana);
        }
    }

    get my_mana() {return this._my_mana;};
    get op_mana() {return this._op_mana;};
    get maxMana() {return this._maxMana;}
    get maxManaOp() {return this._maxManaOp;}

    overlap_handler(mycard, opcard) {
        if(mycard.dropped && this.my_turn) {
            mycard.dropped = false;
            console.log('attacking from overlap');
            this.scene.network.CardAttacked({
                my_card: opcard.GetIndex(this.scene.opBoardGroup), 
                op_card: mycard.GetIndex(this.scene.boardGroup)
            })

            mycard.strike(opcard);
            
            if(mycard.double_attack && !this.attack_counter)
                this.attack_counter++;
            else {
                this.wait_for_strike(mycard);
                this.attack_counter = 0;
            }

                
        }
    }

    add_attack_handler(card) {
        card.on('pointerup', (pointer) => {
            if(pointer.leftButtonReleased() && this.my_turn)
                card.dropped = true;
        })
    }

    check_step_ability(card) {
        return this.my_turn && this.my_mana >= card.cost && card.draggable && this.scene.zone.dropZone.data.values.cards < 6;
    }

    check_strike_ability(card) {
        return this.striking_cards.find(el => el === card) && this.my_turn && card.draggable ? true : false;
    }

    wait_for_strike(card) {
        this.striking_cards = this.striking_cards.filter(el => el != card);
        this.waiting_cards.push(card);
    }

    wait_for_ability(card) {
        this.cards_with_end_turn_abilities.push(card);
    }

    prepare_to_strike() {
        for(let card of this.waiting_cards) {
            this.striking_cards.push(card);
        }
        for(let card of this.cards_with_end_turn_abilities) {
            card.use_ability();
        }
        this.cards_with_end_turn_abilities = [];
        this.waiting_cards = [];
    }

    create_mana_stone(ToOp = null) {
        if(ToOp) {
            this.mana_stone = this.scene.add.sprite(this.textManaOp.x - 130, this.textManaOp.y + 35, 'mana_op')
            .setScale(0.4)
        }
        else {
            this.mana_stone = this.scene.add.sprite(this.textMana.x - 130, this.textMana.y + 35, 'mana')
            .setScale(0.4)
            .setInteractive();
            this.mana_stone.on('pointerover', () => {
                if(this.my_turn) {
                    this.tween = this.scene.tweens.add({
                        targets: this.mana_stone,
                        scaleX: 0.5,
                        scaleY: 0.5,
                        duration: 400,
                        yoyo: true,
                        repeat: -1
                    })
                    this.glow = glow(this.scene, this.mana_stone);
                }
            })
            this.mana_stone.on('pointerout', () => {
                if(this.my_turn) {
                    this.tween.stop();
                    this.glow.stop_glow();
                    this.scene.tweens.add({
                        targets: this.mana_stone,
                        scaleX: 0.4,
                        scaleY: 0.4,
                        duration: 200
                    })
                }
            })
            this.mana_stone.on('pointerup', (pointer) => {
                if(pointer.leftButtonReleased() && this.my_turn) {
                    shake(this.scene, this.mana_stone);
                    this.scene.tweens.add({
                        targets: this.mana_stone,
                        alpha: 0,
                        duration: 200,
                        callbackScope: this,
                        onStart: () => { this.scene.sound.add('mana').play();},
                        onComplete: () => {
                            emit_particle_splash(this.scene, this.mana_stone.x, this.mana_stone.y, 'blue');
                            this.my_mana++;
                            this.scene.network.ManaStoneUsed();
                            this.mana_stone.destroy();
                        } 
                    })
                }
            })
        }
    }
    
    use_mana(card, IsOp = null) {
        if(IsOp)
            this.op_mana -= card.cost;
        else
            this.my_mana -= card.cost;
    }

    restore_mana(IsOp = null) {
        if(IsOp)
            this.op_mana = this.maxManaOp;
        else    
            this.my_mana = this.maxMana;
    }

    create_countdown() {
        const COLOR_BAR = this.my_turn ? 0x000080 : 0xFF0000;
        const COLOR_TRACK = 0xA9A9A9;
        
        this.countdown = this.scene.add.rexCircularProgress({
            x: this.scene.game.config.width * 0.92, 
            y: this.scene.game.config.height / 2,
            radius: 95.5,
            trackColor: COLOR_TRACK,
            barColor: COLOR_BAR,
            value: 0
        })
    }
    
    start_countdown() {
        const COLOR_BAR = 0xFF0000;
        this.countdown_tween = this.scene.tweens.add({
            targets: this.countdown,
            value: 1,
            duration: 90000,
            ease: 'Linear',
            callbackScope: this,
            onComplete: () => {
                if(this.my_turn) {
                    //console.log('Count down completed, sending signal');
                    this.reset_coundown(COLOR_BAR, true);
                }
            }
        })
    }

    reset_coundown(color, NeedFlip = false) {
        this.countdown_tween = this.scene.tweens.add({
            targets: this.countdown,
            value: 0,
            duration: 200,
            ease: 'Linear',
            callbackScope: this,
            onComplete: () => {
                this.countdown.barColor = color;
                this.start_countdown();
                if(NeedFlip) {
                    //console.log('Count down reset, restart...', this.my_turn);
                    this.scene.coin.emit('pointerup');
                }
                // else   
                //     console.log('reseting from signal');
            }
        })
    }

    coin_flip_handler() {
        if(this.coin.texture.key == 'coin_on') {
            const COLOR_BAR = 0xFF0000;
            this.manager.flip_sound.play();

            for(let card of this.boardGroup.getChildren()) {
                card.dropped = false;   //please help
            }

            this.manager.prepare_to_strike();
            this.manager.maxMana++;
            this.manager.restore_mana();

            this.manager.turn_counter++
            if(this.manager.turn_counter == 1) {  //deals card every 2 turns
                this.dealer.giveCard(false, true);
                this.network.UseAbility({key: 'take_card'}, 1);
                this.manager.turn_counter = 0;
            }
            
            this.manager.my_turn = false;
            this.network.TurnFinished();

            this.manager.countdown_tween.stop();
            this.manager.reset_coundown(COLOR_BAR);

            coin_flip(this, 'coin_off', 0.235);

            if(this.manager.check_loose_condition()) {
                this.network.GameOver();
                console.log("LOOSER");
                this.manager.show_end_game();
            }
        }
        // else {  //выпилить в релизе
        //     this.manager.op_mana++;
        //     trans_image = 'coin_on';
        //     scaleSize = 0.15;
        //     this.manager.my_turn = true;
        // }
        
    }

    check_loose_condition() {
        return this.scene.boardGroup.getLength() < 1 && this.scene.handGroup.getLength() < 1;
    }

    show_end_game(IsWin = false) {
        let text = IsWin ? 'YOU WIN!' : 'YOU LOOSE!';
        let color = IsWin ? 'green' : 'red';
        disable_interactions(this.scene);
        this.countdown_tween.stop();
        fade_out_background(this.scene, [...this.scene.children.list]);
        let end_game_label = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2, text, 
            {fontSize: '200px'}
            )
            .setOrigin(0.5)
            .setVisible(false);
        particle_text(this.scene, end_game_label, color);
        this.scene.input.enabled = false;
        setTimeout(() => {
            document.location = '/game';
        }, 5000)
    }

    surrender_menu() {
        let focus = fade_out_background(this.scene, 
            [...this.scene.children.list]);
        disable_interactions(this.scene);
        let IsOnText = false;
        let text = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2, 
            'SURRENDER', 
            {fontSize: '100px', fontFamily: 'Arial'})
                .setInteractive()
                .setOrigin(0.5);

        text.on('pointerover', () => {
            IsOnText = true;
            text.setColor('red');
        })
        text.on('pointerout', () => {
            IsOnText = false;
            text.setColor('white');
        })
        text.once('pointerup', () => {
            this.scene.network.GameOver();
            this.show_end_game();
            text.destroy();
        })

        this.scene.input.once('pointerup', () => {
            if(!IsOnText) {
                focus.fade_back();
                restore_interactions(this.scene);
                text.destroy();
            }
        })

    }
}