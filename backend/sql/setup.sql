-- create extensions

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- create tables

DROP TABLE IF EXISTS member CASCADE;

CREATE TABLE member (
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32),
    tag CHAR(4) DEFAULT LPAD(floor(random() * 10000)::TEXT, 4, '0'),
    login_info jsonb,
    UNIQUE (username, tag)
);
