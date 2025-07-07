// use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use std::{
    // env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

#[derive(Serialize, Deserialize, Clone)]
pub struct Friend {
    id: String,  // will be encrypted
    username: String,
    tag: String
}
// pfp support coming soon

#[derive(Serialize, Deserialize, Clone)]
pub struct FriendRequest {
    pub username: String,
    pub tag: String
}

pub async fn get_friends(client: &Arc<Client>, id: String) -> Vec<Friend> {
    let query = r#"
SELECT id::VARCHAR, username, tag
FROM member
WHERE id IN (
    SELECT id1
    FROM friendship
    WHERE id2::TEXT = $1::TEXT
    UNION
    SELECT id2
    FROM friendship
    WHERE id1::TEXT = $1::TEXT);
"#;
    let rows_result: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows_result
        .into_iter()
        .map(|row| 
            Friend {
                id: row.get::<&str, String>("id"),
                username: row.get::<&str, String>("username"),
                tag: row.get::<&str, String>("tag")
            }
        )
        .collect();
}

pub async fn get_outgoing_friend_requests(client: &Arc<Client>, id: String) -> Vec<Friend> {
    let query = r#"
SELECT m.id::VARCHAR, m.username, m.tag
FROM member m
INNER JOIN friend_requests fr
ON m.id = fr.receiver
WHERE fr.sender::TEXT = $1::TEXT;
"#;
    let rows_result: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows_result
        .into_iter()
        .map(|row| 
            Friend {
                id: row.get::<&str, String>("id"),
                username: row.get::<&str, String>("username"),
                tag: row.get::<&str, String>("tag")
            }
        )
        .collect();
}

pub async fn get_incoming_friend_requests(client: &Arc<Client>, id: String) -> Vec<Friend> {
    let query = r#"
SELECT m.id::VARCHAR, m.username, m.tag
FROM member m
INNER JOIN friend_requests fr
ON m.id = fr.sender
WHERE fr.receiver::TEXT = $1::TEXT;
"#;
    let rows_result: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows_result
        .into_iter()
        .map(|row| 
            Friend {
                id: row.get::<&str, String>("id"),
                username: row.get::<&str, String>("username"),
                tag: row.get::<&str, String>("tag")
            }
        )
        .collect();
}

pub async fn send_friend_request(client: &Arc<Client>, id: String, recipient: FriendRequest) -> bool {
    let query = r#"
INSERT INTO friend_requests (
    sender,
    receiver
)
VALUES (
    CAST($1::TEXT AS UUID),
    (
        SELECT id
        FROM member
        WHERE username = $2::TEXT
        AND tag = $3::TEXT
    )
)
RETURNING *;
"#;
    let rows_result = client
        .query(query, &[&id, &recipient.username, &recipient.tag])
        .await;
    return match rows_result {
        Ok(rows) => rows.len() > 0,
        Err(_err) => false,
    };
}
