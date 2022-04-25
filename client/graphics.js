let game;
let gameOptions = {
    startingCards: 6,
    cardWidth: 265,
    cardHeight: 400,
    handSizeRatio: 0.7,
    boardSizeRatio: 0.5
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 1280,
            height: 740
        },
        scene: playGame
    }
    game = new Phaser.Game (gameConfig);
    window.focus();
}
class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    preload() {
        this.load.image("background", "../assets/background.jpg");
        this.load.spritesheet("cards", "../assets/cards.png", {
            frameWidth: gameOptions.cardWidth,
            frameHeight: gameOptions.cardHeight
        });
    }
    create() {
 
        // group containing cards on board
        this.boardGroup = this.add.group();
 
        // group containing cards in hand
        this.handGroup = this.add.group();
 
        // game background
        this.background = this.add.sprite(game.config.width / 2, game.config.height / 2, "background");
 
        // creation of card preview sprite
        this.createCardPreview();
 
        // set a drop zone
        this.zone = this.add.zone(650, 460, 800, 200);
        this.zone.setRectangleDropZone(800, 200);
 
        // create and place cards in hand
        for(let i = 0; i < gameOptions.startingCards; i ++) {
            this.createCard(i);
        }
 
        // listener fired when we start dragging
        this.input.on("dragstart", function(pointer, card) {
 
            // is the card in hand?
            if(this.handGroup.contains(card)) {
 
                // remove card from hand
                this.handGroup.remove(card);
 
                // re-arrange cards in hand
                this.arrangeCardsInHand();
 
                // bring the card in front
                card.setDepth(this.handGroup.countActive());
 
                // set card preview frame to match dragged card frame
                this.cardPreview.setFrame(card.frame.name);
 
                // tween to animate the card
                this.tweens.add({
                    targets: card,
                    angle: 0,
                    x: pointer.x,
                    y: pointer.y,
                    displayWidth: gameOptions.cardWidth,
                    displayHeight: gameOptions.cardHeight,
                    duration: 150
                });
 
                // tween to fade the background
                this.tweens.add({
                    targets: this.background,
                    alpha: 0.3,
                    duration: 150
                });
            };
        }, this);
 
        // listener fired when we are dragging
        this.input.on("drag", function(pointer, card) {
 
            // if the card is not in hand and not on the board...
            if(!this.handGroup.contains(card) && !this.boardGroup.contains(card)) {
                // move the card to pointer position
                card.x = pointer.x;
                card.y = pointer.y;
            }
        }, this);
 
        // listener fired when we are dragging and the input enters the drop zone
        this.input.on("dragenter", function() {
 
 
            // show card preview
            this.cardPreview.visible = true;
 
            // arrange cards on board
            this.arrangeCardsOnBoard(true);
        }, this);
 
        // listener fired when we are dragging and the input leaves the drop zone
        this.input.on("dragleave", function() {
 
            // hide card preview
            this.cardPreview.visible = false;
 
            // arrange cards on board
            this.arrangeCardsOnBoard(false);
        }, this);
 
        // listener fired when we are dragging and the input leaves the drop zone
        this.input.on("drop", function(pointer, card) {
 
            card.setDepth(0);
 
            // move the card on its final position
            this.tweens.add({
                targets: card,
                angle: 0,
                x: this.cardPreview.x,
                y: this.cardPreview.y,
                displayWidth: gameOptions.cardWidth * gameOptions.boardSizeRatio,
                displayHeight: gameOptions.cardHeight * gameOptions.boardSizeRatio,
                duration: 150,
                callbackScope: this,
                onComplete: function(){
 
                    // little camere shake
                    this.cameras.main.shake(300, 0.02);
 
                    // add the card to board group
                    this.boardGroup.add(card);
 
                    // arrange cards on board
                    this.arrangeCardsOnBoard(false);
                }
            });
        }, this);
 
        // listener fired when we stop dragging
        this.input.on("dragend", function(pointer, card, dropped) {
 
                if(!this.handGroup.contains(card) && !this.boardGroup.contains(card)) {
                    // hide card preview
                    this.cardPreview.visible = false;
 
                    // if the card hasn't been dropped in the drop zone...
 
                    if(!dropped) {
                        // add dragged card to hand group
                        this.handGroup.add(card);
 
                        // arrange cards in hand
                        this.arrangeCardsInHand();
                    }
 
                    // tween to make the background visible again
                    this.tweens.add({
                        targets: this.background,
                        alpha: 1,
                        duration: 150
                    });
                }
        }, this);
    }
 
    // THE FOLLOWING METHODS ARE ONLY USED TO SET CARDS POSITION, BOTH IN HAND AND ON THE TABLE
 
    // method to create the sprite used to preview card
    createCardPreview() {
        this.cardPreview = this.add.sprite(0, 0, "cards");
        this.cardPreview.visible = false;
        this.cardPreview.alpha = 0.25;
        this.cardPreview.displayWidth = gameOptions.cardWidth * gameOptions.boardSizeRatio;
        this.cardPreview.displayHeight = gameOptions.cardHeight * gameOptions.boardSizeRatio;
        this.cardPreview.setOrigin(0.5, 1);
    }
 
    // method to create a card
    // n = card number
    createCard(n) {
        let coordinates = this.setHandCoordinates(n, gameOptions.startingCards);
        let card = this.add.sprite(coordinates.x, coordinates.y, "cards", n);
        card.setOrigin(0.5, 1);
        card.rotation = coordinates.r;
        card.handPosition = n;
        card.setInteractive({
            draggable: true
        });
        card.displayWidth = gameOptions.cardWidth * gameOptions.handSizeRatio;
        card.displayHeight = gameOptions.cardHeight * gameOptions.handSizeRatio;
        this.handGroup.add(card);
    }
 
    // method to set card board coordinates
    // n = card card number
    // totalCards = amount of cards on the board
    setPreviewCoordinates(n, totalCards) {
        return {
            x: game.config.width / 2 - (totalCards - 1) * gameOptions.cardWidth * gameOptions.boardSizeRatio * 0.6 + n * gameOptions.cardWidth * gameOptions.boardSizeRatio * 1.2,
            y: 700
        }
    }
 
    // method to arrange cards on board
    // preview = true if we have to show card preview
    arrangeCardsOnBoard(preview) {
 
        // determine the amount of cards on board, preview included
        let cardsOnBoard = this.boardGroup.countActive() + (preview ? 1 : 0);
 
        // set position of the cards on board
        this.boardGroup.children.iterate(function(card, i) {
            let coordinates = this.setPreviewCoordinates(i, cardsOnBoard);
            card.x = coordinates.x;
            card.y = coordinates.y;
        }, this);
 
        // set the position of card preview, if any
        if(preview){
            let cardPreviewPosition = this.setPreviewCoordinates(cardsOnBoard - 1, cardsOnBoard);
            this.cardPreview.x = cardPreviewPosition.x;
            this.cardPreview.y = cardPreviewPosition.y;
        }
    }
 
    // method to set card in hand coordinates
    // n = card card number
    // totalCards = amount of cards on the board
    setHandCoordinates(n, totalCards) {
        let rotation = Math.PI / 4 / totalCards * (totalCards - n - 1);
        let xPosition = game.config.width + 200 * Math.cos(rotation + Math.PI / 2);
        let yPosition = game.config.height + 200 - 200 * Math.sin(rotation + Math.PI / 2);
        return {
            x: xPosition,
            y: yPosition,
            r: -rotation
        }
    }
 
    // method to arrange cards in hand
    arrangeCardsInHand() {
        this.handGroup.children.iterate(function(card, i) {
            card.setDepth(i);
            let coordinates = this.setHandCoordinates(i, this.handGroup.countActive());
            this.tweens.add({
                targets: card,
                rotation: coordinates.r,
                x: coordinates.x,
                y: coordinates.y,
                displayWidth: gameOptions.cardWidth / 2,
                displayHeight: gameOptions.cardHeight / 2,
                duration: 150
            });
        }, this);
    }
}