const jwt = require("jsonwebtoken");
const secureKey = "eb686e3c7e34ecc1a1f0d5efa40dabc7549d5624ef9e2b65521a1d688101f470d1de246e7147ab3fe5591b19637521b8";
const userDB = require('../data_base/models/user');
const DeckDB = require("./../data_base/models/deck");
const CardDB = require("./../data_base/models/card");
const { join } = require("path");


exports.  isAuth = function (req, resp, next) {
    try {
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, secureKey);
            resp.user = decoded;
        }
        next();
    }
    catch (e) {
        console.log(e);
        return resp.status(403).json({ message: e });
    }

}
exports.checkAuth = function (req, resp, next) {
    try {
        if (!req.cookies.token) {
            return resp.status(403).json({ message: "Not autorize" });
        } else {
            const decoded = jwt.verify(req.cookies.token, secureKey);
            resp.user = decoded;
        }
        next();
    }
    catch (e) {
        console.log(e);
        return resp.status(403).json({ message: e });
    }
}

exports.index = function (req, resp) {
    if (resp.user)
        resp.redirect("/game");
    else
        resp.redirect("/log_in");
}

exports.game = function(req, resp){
    resp.sendFile(join(__dirname, '.././views/layouts/game.html'));
}

exports.isAuth = function (req, resp, next) {
    try {
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, secureKey);
            resp.user = decoded;
        }
        next();
    }
    catch (e) {
        console.log(e);
        return resp.status(403).json({ message: e });
    }

}
exports.auth = function (req, resp, next) {
    try {
        if (!req.cookies.token) {
            return resp.status(403).json({ message: "Not autorize" });
        } else {
            const decoded = jwt.verify(req.cookies.token, secureKey);
            resp.user = decoded;
        }
        next();
    }
    catch (e) {
        console.log(e);
        return resp.status(403).json({ message: e });
    }
}



exports.getLogin = function (req, resp) {
    resp.sendFile(join(__dirname, ".././views/layouts/login.html"));
}

exports.getRemaindPassword = function (req, resp) {
    resp.sendFile(join(__dirname, "./views/layouts/remind_password.html"));
}

exports.postLogin = async function (req, resp) {
    const { login, password } = req.body;
    let user = await userDB.getUser(login);
    console.log(user);
    if (!user) {
        resp.json({ status: false, message: "user not found" })
    }
    else if (user.password == password) {
        let token = jwt.sign(user, secureKey);
        resp.cookie("token", token);
        resp.json({ found: true });

    }
    else {
        resp.json({ found: false })
    }
}

exports.postRegistration = async function (req, resp) {
    const findU = await userDB.getUser(req.body.login)
    if(findU)
        resp.json("login");
    else if (await userDB.save(req.body)) {
        let user = await userDB.getUser(req.body.login);
        let token = jwt.sign(user, secureKey);
        resp.cookie("token", token);
        resp.json({ found: true, message: "User created" });
    } else {
        resp.json("email");
    }
}

exports.postRemindPassword = async function (req, resp) {
    const { login } = req.body;
    let user = await userDB.getUser(login);
    if (!user) {
        resp.json({ found: false, message: "user not found" });
    }
    else {
        let { email, password } = user;
        const mailSender = require("./mailSender");
        await mailSender(email, password);
        resp.json({ found: true, message: "check your email for the password" });
    }
}

exports.logOut = function (req, resp) {
    resp.clearCookie("token");
    resp.redirect("/log_in");
}

exports.getUser = function (req, resp) {
    resp.json(resp.user);
}

exports.getRegistration = function (req, resp) {
    resp.sendFile(join(__dirname, ".././views/layouts/registration.html"));
}

exports.deckView = function (req, resp) {
    resp.sendFile(join(__dirname, ".././views/layouts/new_deck.html"));
}

exports.decksView = function (req, resp) {
    resp.sendFile(join(__dirname, ".././views/layouts/decks.html"));
}

exports.getUserDecks = async function (req, resp) {
    const user = resp.user;

    resp.json([await DeckDB.getUserDecks({user_id: user.ID, starter: true}), user.deck_id]);
}

exports.getCards = async function (req, resp) {   
    resp.json(await  CardDB.getCards());
}
exports.postDeck = async function (req, resp) {
    const user = resp.user;
    console.log(req.body.deck)
    resp.json(await DeckDB.setDecks([{name: req.body.name, user_id: user.ID, cards: req.body.deck}]));
}
exports.setUserDeck = async function (req, resp) {
    const user = resp.user;
    user.deck_id = req.body.deck_id;
    let token = jwt.sign(user, secureKey);
        resp.cookie("token", token);
    resp.json(await userDB.save({id: user.ID, deck_id: req.body.deck_id}));
}

exports.deleteUserDeck = async function (req, resp) {
    const user = resp.user;
    if (user.deck_id == req.body.deck_id && user.deck_id != 51) {        
        console.log(user)
        user.deck_id = 51;
        let token = jwt.sign(user, secureKey);
            resp.cookie("token", token);
        await userDB.save({id: user.ID, deck_id: 51})
    }
    await DeckDB.delete(req.body.deck_id)
    resp.json("ok");
}