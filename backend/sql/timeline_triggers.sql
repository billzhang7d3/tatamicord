-- timeline creation trigger

CREATE FUNCTION create_channel_pretrigger_helper()
RETURNS TRIGGER AS
$BODY$
DECLARE
    channel_id TEXT;
BEGIN
    INSERT INTO channel (channel_name)
    VALUES ('general')
    RETURNING id INTO channel_id;
    NEW.default_channel := channel_id;
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE FUNCTION create_channel_posttrigger_helper()
RETURNS TRIGGER AS
$BODY$
BEGIN
    UPDATE channel
    SET timeline_id = NEW.id
    WHERE id = NEW.default_channel;
    -- join user
    INSERT INTO member_timeline (
        member_id,
        timeline_id
    ) VALUES (
        NEW.timeline_owner,
        NEW.id
    );
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER create_channel_pretrigger
BEFORE INSERT
ON timeline
FOR EACH ROW
EXECUTE FUNCTION create_channel_pretrigger_helper();

CREATE TRIGGER create_channel_posttrigger
AFTER INSERT
ON timeline
FOR EACH ROW
EXECUTE FUNCTION create_channel_posttrigger_helper();



-- delete timeline function

CREATE FUNCTION invalidate_timeline(existing_timeline_id UUID, owner_id UUID)
RETURNS UUID AS
$BODY$
DECLARE
    existing_timeline_name VARCHAR(32);
BEGIN
    -- check if member is owner and if timeline exists
    SELECT timeline_name INTO existing_timeline_name
    FROM timeline
    WHERE id = existing_timeline_id
    AND timeline_owner = owner_id;
    IF existing_timeline_name IS NULL THEN
        RAISE EXCEPTION 'member is not owner of timeline';
    END IF;
    -- delete invites
    DELETE FROM invite
    WHERE timeline_id = existing_timeline_id;
    -- delete messages - they should be accessed with channel id as well
    DELETE FROM message
    WHERE location IN (
        SELECT ch.id
        FROM channel ch
        WHERE ch.timeline_id = existing_timeline_id
    );
    -- nullify channels
    UPDATE channel
    SET
        channel_name = NULL,
        timeline_id = NULL
    WHERE timeline_id = existing_timeline_id;
    -- nullify timeline
    UPDATE timeline
    SET
        timeline_name = NULL,
        timeline_owner = NULL,
        default_channel = NULL
    WHERE id = existing_timeline_id;
    RETURN existing_timeline_id;
END;
$BODY$
LANGUAGE plpgsql;
