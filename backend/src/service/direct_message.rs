use std::sync::Arc;

use tokio_postgres::{Client, Row};

use crate::types::{DirectMessage, Message};

pub async fn get_dm_list(
    client: &Arc<Client>,
    id: String
) -> Vec<DirectMessage> {
    let query = r#"
SELECT *
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
    m.id AS id,
    m.location AS location,
    m.sender AS sender,
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