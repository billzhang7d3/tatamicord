CREATE FUNCTION join_timeline(invite_code TEXT, joiner_id UUID)
RETURNS SETOF member_timeline AS
$BODY$
DECLARE
    existing_timeline UUID;
BEGIN
    SELECT timeline_id INTO existing_timeline
    FROM invite
    WHERE code = invite_code;
    IF existing_timeline IS NULL THEN
        RAISE EXCEPTION 'invalid invite';
    END IF;
    RETURN QUERY INSERT INTO member_timeline (
        member_id,
        timeline_id
    ) VALUES (
        joiner_id,
        existing_timeline
    ) RETURNING *;
END;
$BODY$
LANGUAGE plpgsql;
