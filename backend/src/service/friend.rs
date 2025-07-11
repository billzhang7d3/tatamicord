// use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use std::{
    // env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

#[derive(Serialize, Deserialize, Clone)]
pub struct Friend {
    id: String,
    username: String,
    tag: String
}
// pfp support coming soon

#[derive(Serialize, Deserialize, Clone)]
pub struct FriendRequest {
    pub username: String,
    pub tag: String
}

pub enum FriendRequestError {
    FriendNotExists,  // also encodes blocked
    FriendRequestExists,
    AlreadyFriends
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
INNER JOIN friend_request fr
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
INNER JOIN friend_request fr
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

pub async fn send_friend_request(
    client: &Arc<Client>,
    id: String,
    recipient: FriendRequest
) -> Result<(), FriendRequestError> {
    let query = r#"
INSERT INTO friend_request (
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
    let row_result = client
        .query_one(query, &[&id, &recipient.username, &recipient.tag])
        .await;
    return match row_result {
        Ok(_row) => Ok(()),
        Err(err) => {
            if err.to_string() == "db error: ERROR: already friends" {
                return Err(FriendRequestError::AlreadyFriends);
            } else if err.to_string() == "db error: ERROR: already sent" {
                return Err(FriendRequestError::FriendRequestExists);
            }
            Err(FriendRequestError::FriendNotExists)
        },
    };
}

pub async fn accept_friend_request(
    client: &Arc<Client>,
    sender_id: String,
    receiver_id: String
) -> Result<(), String> {
    let query = r#"
INSERT INTO friendship (
    id1,
    id2
)
VALUES (
    CAST($1::TEXT AS UUID),
    CAST($2::TEXT AS UUID)
) RETURNING id1::VARCHAR, id2::VARCHAR;
"#;
    let row = client
        .query_one(query, &[&sender_id, &receiver_id])
        .await;
    return match row {
        Ok(_) => Ok(()),
        Err(_err) => Err("nonexistent friend request".to_string())
    };
}

pub async fn delete_friend_request(
    client: &Arc<Client>,
    sender_id: String,
    receiver_id: String
) -> Result<(), String> {
    let query = r#"
DELETE FROM friend_request
WHERE (sender::TEXT = $1::TEXT AND receiver::TEXT = $2::TEXT)
OR (sender::TEXT = $2::TEXT AND receiver::TEXT = $1::TEXT)
RETURNING *;
"#;
    let row = client
        .query_one(query, &[&sender_id, &receiver_id])
        .await;
    return match row {
        Ok(_) => Ok(()),
        Err(_err) => Err("nonexistent friend request".to_string())
    }
}
