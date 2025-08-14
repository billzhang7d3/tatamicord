use std::sync::Arc;

use tokio_postgres::{Client, Row};

use crate::types::{Channel, Member, Message};


pub async fn get_channels_from_timeline(
    client: &Arc<Client>,
    id: String
) -> Vec<Channel> {
    let query = r#"
SELECT
    id::TEXT,
    channel_name,
    timeline_id::TEXT AS timeline_id
FROM channel
WHERE timeline_id::TEXT = $1::TEXT;"#;
    let rows: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows.iter().map(|row| Channel {
        id: row.get::<&str, String>("id"),
        name: row.get::<&str, String>("channel_name"),
        timeline: row.get::<&str, String>("timeline_id")
    }).collect();
}

pub async fn create_channel(
    client: &Arc<Client>,
    name: String,
    timeline_id: String
) -> Channel {
    let query = r#"
INSERT INTO channel (
    channel_name,
    timeline_id
) VALUES ($1, CAST($2::TEXT AS UUID))
RETURNING id::TEXT, channel_name, timeline_id::TEXT AS timeline_id;"#;
    let row = client
        .query_one(query, &[&name, &timeline_id])
        .await
        .unwrap();
    return Channel {
        id: row.get::<&str, String>("id"),
        name: row.get::<&str, String>("channel_name"),
        timeline: row.get::<&str, String>("timeline_id")
    }
} 

pub async fn get_all_messages_from_channel(
    client: &Arc<Client>,
    channel_id: String
) -> Vec<Message> {
    let query = r#"
SELECT
    msg.id::TEXT AS msg_id,
    msg.location::TEXT AS location,
    m.id::TEXT AS member_id,
    m.username AS username,
    m.tag AS tag,
    msg.content AS content,
    msg.time_sent AS time_sent,
    msg.edited AS edited
FROM message msg
INNER JOIN member m
ON m.id = msg.sender
WHERE msg.location::TEXT = $1::TEXT;"#;
    let rows = client
        .query(query, &[&channel_id])
        .await
        .unwrap();
    return rows.iter().map(|row| Message {
        id: row.get::<&str, String>("msg_id"),
        location: row.get::<&str, String>("location"),
        sender: Member {
            id: row.get::<&str, String>("member_id"),
            username: row.get::<&str, String>("username"),
            tag: row.get::<&str, String>("tag")
        },
        content: row.get::<&str, String>("content"),
        time_sent: row.get::<&str, String>("time_sent"),
        edited: row.get::<&str, bool>("edited")
    }).collect();
}

pub async fn send_message(
    client: &Arc<Client>,
    sender: String,
    channel: String,
    message: String
) -> Result<Message, String> {
    let query = r#"
SELECT
    msg.id::TEXT AS msg_id,
    msg.location::TEXT AS location,
    m.id::TEXT AS member_id,
    m.username AS username,
    m.tag AS tag,
    msg.content AS content,
    msg.time_sent AS time_sent,
    msg.edited AS edited
FROM send_message(CAST($1::TEXT AS UUID), CAST($2::TEXT AS UUID), $3::TEXT) msg
INNER JOIN member m
ON m.id = msg.sender;"#;
    let row_result = client
        .query_one(query, &[&sender, &channel, &message])
        .await;
    return match row_result {
        Ok(row) => Ok(Message {
            id: row.get::<&str, String>("msg_id"),
            location: row.get::<&str, String>("location"),
            sender: Member {
                id: row.get::<&str, String>("member_id"),
                username: row.get::<&str, String>("username"),
                tag: row.get::<&str, String>("tag")
            },
            content: row.get::<&str, String>("content"),
            time_sent: row.get::<&str, String>("time_sent"),
            edited: row.get::<&str, bool>("edited")
        }),
        Err(err) => Err(err.to_string())
    };
}
