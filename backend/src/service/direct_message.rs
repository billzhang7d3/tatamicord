use std::sync::Arc;

use tokio_postgres::{Client, Row};

use crate::types::{DirectMessage, Message};

pub async fn get_dm_list(
    client: &Arc<Client>,
    id: String
) -> Vec<DirectMessage> {
    let query = r#"
SELECT
    id::TEXT,
    member1::TEXT,
    member2::TEXT
FROM direct_message
WHERE $1::TEXT = member1::TEXT
OR $1::TEXT = member2::TEXT
ORDER BY recency_timestamp DESC;"#;
    let rows: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows
        .into_iter()
        .map(|row| {
            let member1 = row.get::<&str, String>("member1").to_owned();
            let member2 = row.get::<&str, String>("member2").to_owned();
            return DirectMessage {
                id: row.get::<&str, String>("id").to_string(),
                sender: if member1 == id {id.clone()} else {member2.clone()},
                receiver: if member2 == id {id.clone()} else {member1}
            };
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
    m.id::TEXT AS id,
    m.location::TEXT AS location,
    m.sender::TEXT AS sender,
    m.content AS content,
    m.time_sent AS time_sent,
    m.edited AS edited
FROM message m
INNER JOIN direct_message dm
ON m.location = dm.id
WHERE (dm.member1::TEXT = $1::TEXT AND dm.member2::TEXT = $2::TEXT) 
OR (dm.member1::TEXT = $2::TEXT AND dm.member2::TEXT = $1::TEXT)
ORDER BY time_sent"#;
    let rows: Vec<Row> = client
        .query(query, &[&id1, &id2])
        .await
        .unwrap();
    return rows
        .into_iter()
        .map(|row| Message {
            id: row.get::<&str, String>("id"),
            location: row.get::<&str, String>("location"),
            sender: row.get::<&str, String>("sender"),
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
    id::TEXT,
    location::TEXT,
    sender::TEXT,
    content,
    time_sent,
    edited
FROM send_direct_message(CAST($1::TEXT AS UUID), CAST($2::TEXT AS UUID), $3::TEXT);"#;
    let row_result = client
        .query_one(query, &[&sender, &receiver, &message])
        .await;
    return match row_result {
        Ok(row) => Ok(Message {
            id: row.get::<&str, String>("id"),
            location: row.get::<&str, String>("location"),
            sender: row.get::<&str, String>("sender"),
            content: row.get::<&str, String>("content"),
            time_sent: row.get::<&str, String>("time_sent"),
            edited: row.get::<&str, bool>("edited")
        }),
        Err(err) => Err(err.to_string())
    };
}
