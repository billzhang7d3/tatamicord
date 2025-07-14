use std::{
    // env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

use crate::types::Timeline;

pub async fn get_timelines(client: &Arc<Client>, id: String) -> Vec<Timeline> {
    let query = r#"
SELECT DISTINCT tl.id AS id, tl.timeline_name AS name
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
                name: row.get::<&str, String>("name")
            }
        })
        .collect();
}
