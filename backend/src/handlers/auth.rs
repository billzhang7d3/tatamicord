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
    let mut status_code: StatusCode = StatusCode::OK;
    let mut response_string = String::from("{\"result\": \"Successfully Registered\"}");
    let register_result = auth::register(&client, body).await;
    if register_result == auth::RegistrationStatus::UsernameError {
        status_code = StatusCode::CONFLICT;
        response_string = String::from("{\"error\":\"All tags taken up for the username.\"}");
    } else if register_result == auth::RegistrationStatus::RegistrationError {
        status_code = StatusCode::FORBIDDEN;
        response_string = String::from("{\"error\":\"Failed to register.\"}");
    }
    return (status_code, response_string).into_response();
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
