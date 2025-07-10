-- create trigger for sending friend requests

CREATE FUNCTION check_valid_FR_send()
RETURNS TRIGGER AS
$BODY$
DECLARE
    id0 UUID;
BEGIN
    SELECT id1 INTO id0
    FROM friendship
    WHERE (id1 = NEW.sender) AND (id2 = NEW.receiver)
    OR (id2 = NEW.sender) AND (id1 = NEW.receiver);
    IF id0 IS NOT NULL THEN
        RAISE EXCEPTION 'already friends';
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