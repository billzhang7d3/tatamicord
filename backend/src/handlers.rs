use crate::service::{friend, login};

use axum::{
    Json,
    extract::State,
    http::StatusCode,
    response::IntoResponse
};
use http::HeaderMap;
use std::sync::Arc;
use tokio_postgres::Client;

pub async fn register_handler(
    State(client): State<Arc<Client>>,
    Json(body): Json<login::RegisterInfo>,
) -> impl IntoResponse {
    let mut status_code: StatusCode = StatusCode::OK;
    let mut response_string = String::from("{\"result\": \"Successfully Registered\"}");
    let register_result = login::register(&client, body).await;
    if register_result == login::RegistrationStatus::UsernameError {
        status_code = StatusCode::CONFLICT;
        response_string = String::from("{\"error\":\"All tags taken up for the username.\"}");
    } else if register_result == login::RegistrationStatus::RegistrationError {
        status_code = StatusCode::FORBIDDEN;
        response_string = String::from("{\"error\":\"Failed to register.\"}");
    }
    return (status_code, response_string).into_response();
}

pub async fn login_handler(
    State(client): State<Arc<Client>>,
    Json(body): Json<login::Credentials>,
) -> impl IntoResponse {
    let auth_option = login::log_in(&client, body).await;
    return match auth_option {
        Some(jwt_response) => (
            StatusCode::OK,
            format!("{{\"result\":\"{}\"}}", &jwt_response),
        ).into_response(),
        _ => (StatusCode::UNAUTHORIZED, "{\"error\":\"Unauthorized.\"}").into_response(),
    };
}

pub async fn get_friends_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>
) -> impl IntoResponse {
    // auth
    let auth_result = login::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // get friends
    let id = auth_result.unwrap().id;
    let friends_list: Vec<friend::Friend> = friend::get_friends(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&friends_list).unwrap()
    ).into_response();
}