use chrono::{TimeDelta, Utc};
use dotenv::dotenv;
use jsonwebtoken::{EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};
use std::{
    env,
    sync::Arc
};
use tokio_postgres::{Client, Row};

#[derive(PartialEq)]
pub enum RegistrationStatus {
    UsernameError,
    RegistrationError,
    Registered,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RegisterInfo {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct UserJwt {
    id: String,
    username: String,
    tag: String,
    exp: i64,
}

pub async fn register(client: &Arc<Client>, register_info: RegisterInfo) -> RegistrationStatus {
    let query = r#"
INSERT INTO member (
    username,
    login_info
)
VALUES (
    $1::TEXT,
    jsonb_build_object(
        'email', $2::TEXT,
        'pw_hash', crypt($3::TEXT, gen_salt('bf'))
    )
)
RETURNING *;"#;
    let rows_result: Result<Vec<Row>, tokio_postgres::Error> = client
        .query(
            query,
            &[
                &register_info.username,
                &register_info.email,
                &register_info.password,
            ],
        )
        .await;
    return match rows_result {
        Ok(_) => RegistrationStatus::Registered,
        Err(_err) => {
            if _err.to_string() == "db error: ERROR: all tags taken" {
                return RegistrationStatus::UsernameError;
            }
            return RegistrationStatus::RegistrationError;
        },
    };
}

pub async fn log_in(
    client: &Arc<Client>,
    credentials: Credentials,
) -> Option<String> {
    // query the username and password, making sure user exists
    let query = r#"
SELECT id::VARCHAR, username, tag
FROM member
WHERE login_info->>'email' = $1::TEXT
AND crypt($2::TEXT, login_info->>'pw_hash') = login_info->>'pw_hash';
"#;
    let rows: Result<Row, tokio_postgres::Error> = client
        .query_one(query, &[&credentials.email, &credentials.password])
        .await;
    if rows.is_err() {
        return None;
    }
    let rows = rows.unwrap();
    // generate and return jwt
    let expiry = Utc::now() + TimeDelta::hours(1);
    let user_jwt = UserJwt {
        id: rows.get::<&str, String>("id"),
        username: rows.get::<&str, String>("username"),
        tag: rows.get::<&str, String>("tag"),
        exp: expiry.timestamp(),
    };
    return Some(encode(
        &Header::default(),
        &user_jwt,
        &EncodingKey::from_secret(get_encoding_secret().as_ref()))
    .unwrap());
}

fn get_encoding_secret() -> String {
    dotenv().ok();
    return env::var("SECRET").unwrap();
}
