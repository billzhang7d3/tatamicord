use std::sync::Arc;

use tokio_postgres::{Client, Row};

use crate::types::Channel;


pub async fn get_channels_from_timeline(
    client: &Arc<Client>,
    id: String
) -> Vec<Channel> {
    let query = r#"
SELECT
    id::TEXT AS id,
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
