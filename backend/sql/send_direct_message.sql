CREATE FUNCTION send_direct_message(sender UUID, receiver UUID, message_content TEXT)
RETURNS SETOF message AS
$BODY$
DECLARE
    existing_dm UUID;
    message_timestamp TEXT;
BEGIN
    SELECT id INTO existing_dm
    FROM direct_message
    WHERE (member1 = sender AND member2 = receiver)
    OR (member2 = sender AND member1 = receiver);
    IF existing_dm IS NULL THEN
        RAISE EXCEPTION 'direct message not found';
    END IF;
    message_timestamp := NOW()::TEXT;
    UPDATE direct_message
    SET recency_timestamp = message_timestamp
    WHERE id = existing_dm;
    RETURN QUERY INSERT INTO message (
        location,
        sender,
        content,
        time_sent
    ) VALUES (
        existing_dm,
        sender,
        message_content,
        message_timestamp
    ) RETURNING *;
END;
$BODY$
LANGUAGE plpgsql;
