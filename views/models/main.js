import Zone from './classes/DropZone.js';
import Dealer from './classes/Dealer.js';
import MatchManager from './classes/MatchManager.js';
import Observer from './classes/Observer.js';
import NetWork from './classes/NetWorkProccesor.js';
import ActionQueue from './classes/ActionQueue.js';
import {loading} from './helpers/animations.js'

let game;
let init_info = null;

export default function start_game(info) {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 1920,
            height: 1080
        },
        physics: {
            default: 'arcade',
            // arcade: {
            //     debug: true
            // }
        },
        scene: [
            playGame
        ]
    }

    init_info = info;
    game = new Phaser.Game (gameConfig);
}

class playGame extends Phaser.Scene {
    constructor() {
        super( {key : 'playGame'});
    }

    preload_assets(pack) {
        for(let el of pack) {
            this.load.image(el, `../models/assets/${el}.png`);
        }
    }

    preload_phrases(pack) {
        for(let el of pack) {
            this.load.audio(`${el}_sound`, `../models/audio/phrases/${el}.mp3`);
        } 
    }

    preload_audio(mp3_pack, wav_pack) {
        for(let el of mp3_pack) {
            this.load.audio(`${el}`, `../models/audio/${el}.mp3`);
        }
        for(let el of wav_pack) {
            this.load.audio(`${el}`, `../models/audio/${el}.wav`);
        }
    }

    preload() {
        this.load.once('progress', (progress) => {
           this.loading = loading(this);
        });
        this.load.plugin('rextransitionimageplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextransitionimageplugin.min.js', true);
        this.load.plugin('rexshakepositionplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexshakepositionplugin.min.js', true);
        this.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
        this.load.plugin('rexbitmapzoneplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbitmapzoneplugin.min.js', true);
        this.load.plugin('rexcircularprogressplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcircularprogressplugin.min.js', true);

        this.load.atlas('flares', '../models/assets/flares.png', '../models/assets/flares.json');

        this.preload_assets(['background', 'coin_on', 'coin_off', 'cover_red', 'cover_purple', 'mana', 'mana_op']);
        this.preload_assets(init_info.assets);
        this.preload_phrases(init_info.assets);
        this.preload_audio(
            ['flip', 'mana', 'snap', 'shield', 'punch', 'fall', 'backMusic'],
            ['deal', 'fireball', 'heal', 'buff', 'summon']
            );
    }

    create() {
        init_info.socket.emit("ready", init_info.room);
        init_info.socket.once("ready", () => {
            this.init_game();
            init_info.socket.emit("ready", init_info.room);
        })
    }

    init_game() {
        this.loading.stop_loading();
        this.scale.startFullscreen();
        this.input.mouse.disableContextMenu();  //some input events
        this.input.keyboard.addKey('F2').on('up', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } 
            else {
                this.scale.startFullscreen();
            }
        });

        let fontConfig = {
            fontFamily: 'Arial',
            fontSize: '40px',
            stroke: 'black',
            strokeThickness: 3
        }

        this.background = this.add.sprite(game.config.width / 2, game.config.height / 2, "background");

        this.my_name = this.add.text(
            this.game.config.width * 0.02,
            this.game.config.height * 0.93,
            init_info.player_info.name,
            fontConfig);

        this.op_name = this.add.text(
            this.game.config.width * 0.02,
            this.game.config.height * 0.02,
            init_info.op_name,
            fontConfig);

        this.boom = this.sound.add('fall');
        this.strike_sound = this.sound.add('punch', {volume: 2});
        this.background_music = this.sound.add('backMusic', {loop: true, volume: 0.3});
        this.background_music.play();

        this.handGroup = this.add.group(); //making groups
        this.opHandGroup = this.add.group();
        this.boardGroup = this.add.group();
        this.opBoardGroup = this.add.group();

        this.zone = new Zone(this);    //creating all entities that need for match
        this.zone.renderZone({
            x: this.game.config.width / 2,
            y: this.game.config.height / 1.55,
            width: 1000,
            height: 250
        });
        this.zone.renderOutline();

        this.action_queue = new ActionQueue();

        this.manager = new MatchManager({
            scene: this,
            IsMyTurn: init_info.turn,
            mana: { my: 1, op: 1},
            maxMana: 1
        });

        this.observer = new Observer(this);
        this.network = new NetWork({
            scene: this, 
            socket: init_info.socket,
            room: init_info.room
        });
        
        this.dealer = new Dealer(this, init_info.deck);
        this.dealer.dealCards(5);
    }
}