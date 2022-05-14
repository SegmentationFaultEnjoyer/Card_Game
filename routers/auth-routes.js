const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require("./../controllers/controller.js");



router.get("/", controller.isAuth , controller.index);

router.get("/game", controller.auth ,controller.game);

router.get("/log_in", controller.getLogin)



router.post("/log_in", controller.postLogin);

router.post("/registration", controller.postRegistration)


router.get("/log_out", controller.auth, controller.logOut);

router.get("/get_user", controller.auth, controller.getUser);

router.get("/registration", controller.getRegistration);

router.get("/deck_viewer", controller.deckView);

router.get("/decks_viewer", controller.decksView);

router.get("/decks", controller.isAuth, controller.getUserDecks);

router.get("/get_cards", controller.getCards);

router.post("/post_deck", controller.isAuth, controller.postDeck);
router.post("/set_user_deck", controller.isAuth, controller.setUserDeck);
router.post("/delete_user_deck", controller.isAuth, controller.deleteUserDeck);

module.exports = router;