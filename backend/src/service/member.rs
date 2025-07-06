use serde::{Deserialize, Serialize};
use std::{
    // env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

#[derive(Serialize, Deserialize, Clone)]
pub struct NewUsername {
    pub new_username: String
}

pub async fn change_username(client: &Arc<Client>, id: String, new_name: String) -> bool {
    let query = r#"
UPDATE member
SET username = $2::TEXT
WHERE id::TEXT = $1::TEXT
RETURNING username, tag;
"#;
    let rows_result: Vec<Row> = client
        .query(
            query,
            &[
                &id,
                &new_name,
            ],
        )
        .await
        .unwrap();
    return rows_result.len() > 0;
}
