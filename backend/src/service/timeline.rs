use std::{
    // env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

use crate::types::{InviteCode, Timeline};

pub async fn get_timelines(client: &Arc<Client>, id: String) -> Vec<Timeline> {
    let query = r#"
SELECT DISTINCT
    tl.id::TEXT AS id,
    tl.timeline_name AS name,
    tl.timeline_owner::TEXT AS owner,
    tl.default_channel::TEXT as default_channel
FROM timeline tl
INNER JOIN member_timeline mt
ON tl.id = mt.timeline_id
WHERE mt.member_id::TEXT = $1::TEXT
AND tl.timeline_name IS NOT NULL;
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
                owner: row.get::<&str, String>("owner"),
                default_channel: row.get::<&str, String>("default_channel")
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
timeline_name AS name,
default_channel::TEXT;
"#;
    let row_result = client
        .query_one(query, &[&id, &name])
        .await;
    return match row_result {
        Ok(row) => Ok(Timeline {
            id: row.get::<&str, String>("id"),
            name: row.get::<&str, String>("name"),
            owner: row.get::<&str, String>("owner"),
            default_channel: row.get::<&str, String>("default_channel")
        }),
        Err(_) => Err("Failed to create timeline".to_string())
        // ^ line will be covered when I make a trigger for server limit
    }
}

pub async fn create_invite(client: &Arc<Client>, timeline_id: String) -> Result<InviteCode, String> {
    let query = r#"
INSERT INTO invite (timeline_id)
VALUES (CAST($1::TEXT AS UUID))
RETURNING code, timeline_id::TEXT;"#;
    let row_result = client
        .query_one(query, &[&timeline_id])
        .await;
    return match row_result {
        Ok(row) => Ok(InviteCode {
            timeline: row.get::<&str, String>("timeline_id"),
            code: row.get::<&str, String>("code")
        }),
        Err(_) => Err("Failed to create invite".to_string())
    };
}

pub async fn join_timeline(client: &Arc<Client>, code: String, member_id: String) -> Result<(), String> {
    let query = r#"
SELECT timeline_id
FROM join_timeline($1::TEXT, CAST($2::TEXT AS UUID));"#;
    let row_result = client
        .query_one(query, &[&code, &member_id])
        .await;
    return match row_result {
        Ok(_row) => Ok(()),
        Err(err) => {
            if err.to_string() == "db error: ERROR: invalid invite" {
                Err("invalid invite".to_owned())
            } else {
                Err("already in timeline".to_owned())
            }
        }
    }
}

pub async fn delete_timeline(client: &Arc<Client>, owner_id: String, timeline_id: String) -> Result<(), String> {
    let query = r#"
SELECT *
FROM invalidate_timeline(CAST($1::TEXT AS UUID), CAST($2::TEXT AS UUID));
    "#;
    let row_result = client
        .query_one(query, &[&timeline_id, &owner_id])
        .await;
    return match row_result {
        Ok(_row) => Ok(()),
        Err(_err) => Err("member is not owner of timeline".to_owned())
    };
}
