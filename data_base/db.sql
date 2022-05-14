/* CREATE DATABASE IF NOT EXISTS game_db;
CREATE USER IF NOT EXISTS 'yivanov'@'localhost' IDENTIFIED BY 'securepass';

GRANT ALL PRIVILEGES ON game_db.* to 'yivanov'@'localhost'; */

USE heroku_cf94862b2e15849;


CREATE TABLE IF NOT EXISTS users(
    ID int NOT NULL AUTO_INCREMENT,
    login VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(40) NOT NULL,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS cards(
    id int NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL UNIQUE,
    attack int,
    defense int,
    cost int NOT NULL,
    ability text not null,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS decks(
    id int NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    user_id int,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (ID)
);

-- choisen user's deck
ALTER TABLE users
ADD deck_id int DEFAULT 1;

SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE users
ADD FOREIGN KEY(deck_id) REFERENCES decks(id) ON DELETE CASCADE ON UPDATE CASCADE;
SET FOREIGN_KEY_CHECKS = 1;
-----------------------------

CREATE TABLE IF NOT EXISTS decks_cards(
    deck_id int NOT NULL,
    card_id int NOT NULL,
    FOREIGN KEY(deck_id) REFERENCES decks(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE ON UPDATE CASCADE
);
