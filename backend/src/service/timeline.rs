use std::{
    // env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

use crate::types::Timeline;

pub async fn get_timelines(client: &Arc<Client>, id: String) -> Vec<Timeline> {
    let query = r#"
SELECT DISTINCT
tl.id::VARCHAR AS id,
tl.timeline_name AS name,
tl.timeline_owner::TEXT AS owner
FROM timeline tl
INNER JOIN member_timeline mt
ON tl.id = mt.timeline_id
WHERE mt.member_id::TEXT = $1::TEXT;
"#;
    let rows_result: Vec<Row> = client
        .query(query, &[&id])
        .await
        .unwrap();
    return rows_result
        .into_iter()
        .map(|row| {
            Timeline {
                id: row.get::<&str, String>("id"),
                name: row.get::<&str, String>("name"),
                owner: row.get::<&str, String>("owner")
            }
        })
        .collect();
}

pub async fn create_timeline(client: &Arc<Client>, id: String, name: String) -> Result<Timeline, String> {
    let query = r#"
INSERT INTO timeline (
    timeline_owner,
    timeline_name
)
VALUES (
    CAST($1::TEXT AS UUID),
    $2::TEXT
)
RETURNING
id::TEXT,
timeline_owner::TEXT AS owner,
timeline_name AS name;
"#;
    let row_result = client
        .query_one(query, &[&id, &name])
        .await;
    return match row_result {
        Ok(row) => Ok(Timeline {
            id: row.get::<&str, String>("id"),
            name: row.get::<&str, String>("name"),
            owner: row.get::<&str, String>("owner")
        }),
        Err(_) => Err("Failed to create timeline".to_string())
        // ^ line will be covered when I make a trigger for server limit
    }
}
