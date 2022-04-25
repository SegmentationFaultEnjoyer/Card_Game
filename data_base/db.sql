CREATE DATABASE game_db;
GRANT ALL PRIVILEGES ON game_db.* to 'mvoishvill'@'localhost';

USE game_db;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users(
    ID int NOT NULL AUTO_INCREMENT,
    login VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(40) NOT NULL,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    PRIMARY KEY (ID)
);