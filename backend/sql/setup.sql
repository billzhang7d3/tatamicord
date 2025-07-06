-- create extensions

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- create tables

DROP TABLE IF EXISTS member CASCADE;

CREATE TABLE member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32),
    tag CHAR(4),
    login_info jsonb,
    UNIQUE (username, tag)
);

DROP TABLE IF EXISTS friendship CASCADE;

CREATE table friendship(
    id1 UUID REFERENCES member(id),
    id2 UUID REFERENCES member(id),
    PRIMARY KEY (id1, id2)
);
