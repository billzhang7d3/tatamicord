use std::sync::Arc;

use tokio_postgres::{Client, Row};

use crate::types::Channel;


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
