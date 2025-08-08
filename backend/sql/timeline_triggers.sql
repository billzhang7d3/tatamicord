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
