use std::sync::Arc;

use tokio_postgres::{Client, Row};

use crate::types::{DirectMessage, Member, Message};

pub async fn get_dm_list(
    client: &Arc<Client>,
    id: String
) -> Vec<DirectMessage> {
    let query = r#"
SELECT
    m1.id::TEXT AS m1_id,
    m1.username AS m1_username,
    m1.tag AS m1_tag,
    dm.id::TEXT AS dm_id,
    m2.id::TEXT AS m2_id,
    m2.username AS m2_username,
    m2.tag AS m2_tag
FROM member m1, direct_message dm, member m2
WHERE m1.id = dm.member1
AND m2.id = dm.member2
AND ($1::TEXT = dm.member1::TEXT
OR $1::TEXT = dm.member2::TEXT)
ORDER BY dm.recency_timestamp DESC;"#;
    let rows: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows
        .into_iter()
        .map(|row| {
            let member1 = row.get::<&str, String>("m1_id").to_owned();
            let decider = if member1 == id { 2 } else { 1 };
            let receiver = Member {
                id: row.get::<&str, String>(&format!("m{}_id", decider)).to_owned(),
                username: row.get::<&str, String>(&format!("m{}_username", decider)).to_owned(),
                tag: row.get::<&str, String>(&format!("m{}_tag", decider)).to_owned()
            };
            return DirectMessage {
                id: row.get::<&str, String>("dm_id").to_string(),
                sender: row.get::<&str, String>(&format!("m{}_id", decider * 2 % 3)).to_string(),
                receiver: receiver
            }
        })
        .collect();
}

pub async fn get_dm_messages(
    client: &Arc<Client>,
    id1: String,
    id2: String
) -> Vec<Message> {
    let query = r#"
SELECT
    msg.id::TEXT AS msg_id,
    msg.location::TEXT AS location,
    mb.id::TEXT AS member_id,
    mb.username AS username,
    mb.tag AS tag,
    msg.content AS content,
    msg.time_sent AS time_sent,
    msg.edited AS edited
FROM message msg, direct_message dm, member mb
WHERE msg.location = dm.id
AND mb.id = msg.sender
AND ((dm.member1::TEXT = $1::TEXT AND dm.member2::TEXT = $2::TEXT)
    OR (dm.member1::TEXT = $2::TEXT AND dm.member2::TEXT = $1::TEXT))
ORDER BY time_sent;"#;
    let rows: Vec<Row> = client
        .query(query, &[&id1, &id2])
        .await
        .unwrap();
    return rows
        .into_iter()
        .map(|row| Message {
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
        })
        .collect();

}

pub async fn initiate_dm(
    client: &Arc<Client>,
    sender: String,
    receiver: String
) -> Result<String, String> {
    let query = r#"
INSERT INTO direct_message (member1, member2)
SELECT CAST($1::TEXT AS UUID), CAST($2::TEXT AS UUID)
WHERE NOT EXISTS (
    SELECT id
    FROM direct_message
    WHERE (member1 = CAST($1::TEXT AS UUID) AND member2 = CAST($2::TEXT AS UUID))
    OR (member1 = CAST($2::TEXT AS UUID) AND member2 = CAST($1::TEXT AS UUID))
) RETURNING id::VARCHAR;"#;
    let row_result = client
        .query_one(query, &[&sender, &receiver])
        .await;
    return match row_result {
        Ok(row) => Ok(row.get::<&str, String>("id")),
        Err(err) => {
            if err.to_string() == "query returned an unexpected number of rows" {
                return Err(err.to_string());
            }
            Err("direct message is already initiated".to_string())
        }
    };
}

pub async fn send_dm(
    client: &Arc<Client>,
    sender: String,
    receiver: String,
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
FROM send_direct_message(CAST($1::TEXT AS UUID), CAST($2::TEXT AS UUID), $3::TEXT) msg
INNER JOIN member m
ON m.id = msg.sender;"#;
    let row_result = client
        .query_one(query, &[&sender, &receiver, &message])
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
