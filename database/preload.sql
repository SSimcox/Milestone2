DROP DATABASE IF EXISTS scoreboard;

CREATE DATABASE scoreboard;

\c scoreboard;

CREATE TABLE scores(
    userid VARCHAR,
    score INTEGER,
    difficulty VARCHAR,
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
    authID VARCHAR UNIQUE,
    displayName VARCHAR,
    email VARCHAR,
    avatarURL VARCHAR,
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
