CREATE FUNCTION send_message(sender_id UUID, channel_id UUID, message_content TEXT)
RETURNS SETOF message AS
$BODY$
DECLARE
    selected_channel_id UUID;
    selected_timeline_id UUID;
BEGIN
    -- check if channel exists
    SELECT id INTO selected_channel_id 
    FROM channel
    WHERE id = channel_id;
    IF selected_channel_id IS NULL THEN
        RAISE EXCEPTION 'location not found';
    END IF;
    -- check if user is in timeline
    SELECT t.id INTO selected_timeline_id
    FROM member m, member_timeline mt, timeline t, channel c
    WHERE m.id = mt.member_id
    AND mt.timeline_id = t.id
    AND t.id = c.timeline_id
    AND m.id = sender_id
    AND c.id = channel_id;
    IF selected_timeline_id IS NULL THEN
        RAISE EXCEPTION 'user is not in specified channel';
    END IF;
    -- send the message
    RETURN QUERY INSERT INTO message (
        location,
        sender,
        content,
        time_sent
    ) VALUES (
        channel_id,
        sender_id,
        message_content,
        NOW()::TEXT
    ) RETURNING *;
END;
$BODY$
LANGUAGE plpgsql;
