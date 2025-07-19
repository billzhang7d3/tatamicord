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

CREATE TABLE friendship(
    id1 UUID REFERENCES member(id),
    id2 UUID REFERENCES member(id),
    PRIMARY KEY (id1, id2)
);

DROP TABLE IF EXISTS friend_request CASCADE;

CREATE TABLE friend_request(
    sender UUID REFERENCES member(id),
    receiver UUID REFERENCES member(id),
    PRIMARY KEY (sender, receiver)
);

DROP TABLE IF EXISTS timeline CASCADE;

CREATE TABLE timeline(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timeline_name VARCHAR(32),
    timeline_owner UUID REFERENCES member(id)
);

DROP TABLE IF EXISTS member_timeline CASCADE;

CREATE TABLE member_timeline (
    member_id UUID REFERENCES member(id),
    timeline_id UUID REFERENCES timeline(id),
    PRIMARY KEY (member_id, timeline_id)
);
