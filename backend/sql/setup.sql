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
    timeline_owner UUID REFERENCES member(id),
    default_channel UUID
);

DROP TABLE IF EXISTS member_timeline CASCADE;

CREATE TABLE member_timeline (
    member_id UUID REFERENCES member(id),
    timeline_id UUID REFERENCES timeline(id),
    PRIMARY KEY (member_id, timeline_id)
);

DROP TABLE IF EXISTS message CASCADE;

CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location UUID NOT NULL,  -- either references channel or DMs
    sender UUID REFERENCES member(id),
    content VARCHAR,
    time_sent VARCHAR,
    edited BOOLEAN DEFAULT false
);

DROP TABLE IF EXISTS channel CASCADE;
CREATE TABLE channel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_name VARCHAR,
    timeline_id UUID REFERENCES timeline(id)
);

DROP TABLE IF EXISTS direct_message CASCADE;
CREATE TABLE direct_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member1 UUID NOT NULL REFERENCES member(id),
    member2 UUID NOT NULL REFERENCES member(id),
    recency_timestamp VARCHAR DEFAULT NOW()::TEXT,
    UNIQUE (member1, member2)
);
ALTER TABLE direct_message
ADD CONSTRAINT check_members_not_equal CHECK (member1 <> member2);

DROP TABLE IF EXISTS invite_code CASCADE;
CREATE TABLE invite_code (
    code VARCHAR(8) PRIMARY KEY DEFAULT substring(gen_random_uuid()::TEXT, 1, 8),
    timeline_id UUID REFERENCES timeline(id)
);
