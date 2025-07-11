-- create trigger for sending friend requests

CREATE FUNCTION check_valid_FR_send()
RETURNS TRIGGER AS
$BODY$
DECLARE
    case1 UUID;
    case2 UUID;
BEGIN
    SELECT id1 INTO case1
    FROM friendship
    WHERE (id1 = NEW.sender AND id2 = NEW.receiver)
    OR (id2 = NEW.sender AND id1 = NEW.receiver);
    IF case1 IS NOT NULL THEN
        RAISE EXCEPTION 'already friends';
    END IF;
    SELECT fr.sender INTO case2
    FROM friend_request fr
    WHERE (fr.sender = NEW.sender AND fr.receiver = NEW.receiver)
    OR (fr.receiver = NEW.sender AND fr.sender = NEW.receiver)
    LIMIT 1;
    IF case2 IS NOT NULL THEN
        RAISE EXCEPTION 'already sent';
    END IF;
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER can_send_friend_request
BEFORE INSERT
ON friend_request
FOR EACH ROW
EXECUTE FUNCTION check_valid_FR_send();


-- create trigger for accepting friend requests

CREATE FUNCTION check_valid_FR_accept()
RETURNS TRIGGER AS
$BODY$
DECLARE
    sender_res UUID;
BEGIN
    DELETE FROM friend_request
    WHERE sender = NEW.id1
    AND receiver = NEW.id2
    RETURNING sender INTO sender_res;
    IF sender_res IS NULL THEN
        RAISE EXCEPTION 'friend request does not exist';
    END IF;
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER can_accept_friend_request
BEFORE INSERT
ON friendship
FOR EACH ROW
EXECUTE FUNCTION check_valid_FR_accept();
