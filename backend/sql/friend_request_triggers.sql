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
    FROM friend_requests fr
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
ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION check_valid_FR_send();


-- create trigger for accepting friend requests

-- CREATE FUNCTION check_valid_FR_accept()
-- RETURNS TRIGGER