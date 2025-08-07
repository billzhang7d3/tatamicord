-- timeline creation trigger

CREATE FUNCTION add_default_member_to_timeline_helper()
RETURNS TRIGGER AS
$BODY$
BEGIN
    INSERT INTO member_timeline (
        member_id,
        timeline_id
    ) VALUES (
        NEW.timeline_owner,
        NEW.id
    );
    INSERT INTO channel (
        channel_name,
        timeline_id
    ) VALUES (
        'general',
        NEW.id
    );
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER add_default_member_to_timeline
AFTER INSERT
ON timeline
FOR EACH ROW
EXECUTE FUNCTION add_default_member_to_timeline_helper();

