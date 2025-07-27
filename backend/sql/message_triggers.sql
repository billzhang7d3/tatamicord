-- create trigger for sending messages

CREATE FUNCTION create_dm_if_not_exists()
RETURNS TRIGGER AS
$BODY$
DECLARE
    existing_dm UUID
BEGIN
    SELECT id INTO existing_dm
    FROM direct_message
    WHERE (member1 = NEW.member1 AND member2 = NEW.member2)
    OR (member2 = NEW.member1 AND member1 = NEW.member2);
    IF existing_dm IS NULL THEN
    END IF;
END;
$BODY$
LANGUAGE plpgsql;