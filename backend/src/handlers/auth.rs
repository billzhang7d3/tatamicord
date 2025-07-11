use crate::service::auth;

use axum::{
    Json,
    extract::State,
    http::StatusCode,
    response::IntoResponse
};
use std::sync::Arc;
use tokio_postgres::Client;

pub async fn register_handler(
    State(client): State<Arc<Client>>,
    Json(body): Json<auth::RegisterInfo>,
) -> impl IntoResponse {
    return match auth::register(&client, body).await {
        Ok(()) => (
            StatusCode::OK,
            "{\"result\": \"Successfully Registered\"}".to_string()
        ).into_response(),
        Err(auth::RegistrationError::UsernameError) => (
            StatusCode::CONFLICT,
            "{\"error\":\"All tags taken up for the username.\"}".to_string()
        ).into_response(),
        Err(auth::RegistrationError::RegistrationError) => (
            StatusCode::FORBIDDEN,
            "{\"error\":\"Failed to register.\"}".to_string()
        ).into_response()
    };
}

pub async fn login_handler(
    State(client): State<Arc<Client>>,
    Json(body): Json<auth::Credentials>,
) -> impl IntoResponse {
    let auth_option = auth::log_in(&client, body).await;
    return match auth_option {
        Some(jwt_response) => (
            StatusCode::OK,
            format!("{{\"result\":\"{}\"}}", &jwt_response),
        ).into_response(),
        _ => (StatusCode::UNAUTHORIZED, "{\"error\":\"Unauthorized.\"}").into_response(),
    };
}
