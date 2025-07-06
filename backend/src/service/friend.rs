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

pub async fn get_incoming_friend_requests(client: &Arc<Client>, id: String) -> Vec <Friend> {
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
