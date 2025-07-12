use crate::types::{Credentials, RegisterInfo, RegistrationError, UserJwt};

use chrono::{TimeDelta, Utc};
use dotenv::dotenv;
use http::HeaderMap;
use jsonwebtoken::{
    Algorithm,
    encode,
    decode,
    DecodingKey,
    EncodingKey,
    Header,
    Validation};
use std::{
    env,
    sync::Arc
};
use tokio_postgres::{Client, Row};


pub async fn register(
    client: &Arc<Client>,
    register_info: RegisterInfo
) -> Result<(), RegistrationError> {
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
        Ok(_) => Ok(()),
        Err(_err) => {
            if _err.to_string() == "db error: ERROR: all tags taken" {
                return Err(RegistrationError::UsernameError);
            }
            Err(RegistrationError::RegistrationError)
        },
    };
}

pub async fn log_in(client: &Arc<Client>, credentials: Credentials) -> Option<String> {
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

pub async fn authenticated(header: &HeaderMap) -> Result<UserJwt, String> {
    let jwt_option = header.get("Authorization");
    if jwt_option.is_none() {
        return Err("Authorization header not found")?;
    }
    let full_jwt = jwt_option
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let mut jwt_split = full_jwt.split(' ');
    let jwt_type = jwt_split.next();
    if jwt_type.is_none() {
        return Err("Authorization header empty")?;
    }
    let jwt = jwt_split.next();
    if jwt.is_none() {
        return Err("Authorization not complete")?;
    }
    // println!("jwt_type: |{}|", jwt_type.unwrap().to_string());
    let validation = Validation::new(Algorithm::HS256);
    let decoded_result = decode::<UserJwt>(
        &jwt.unwrap().to_string(),
        &DecodingKey::from_secret(get_encoding_secret().as_ref()),
        &validation
    );
    return match decoded_result {
        Ok(decoded) => Ok(decoded.claims),
        Err(_err) => Err("Cannot decode token")?
    };
}
 // TODO: do one last check for decoded is_err()

fn get_encoding_secret() -> String {
    dotenv().ok();
    return env::var("SECRET").unwrap();
}
