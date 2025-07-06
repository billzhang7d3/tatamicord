use crate::service::{auth, member};

use axum::{
    Json,
    extract::State,
    http::StatusCode,
    response::IntoResponse
};
use http::HeaderMap;
use std::sync::Arc;
use tokio_postgres::Client;

pub async fn change_username_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<member::NewUsername>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // change username
    let id = auth_result.unwrap().id;
    if member::change_username(&client, id, body.new_username).await {
        return (
            StatusCode::OK,
            "{\"result\":\"Successful.\"}"
        ).into_response();
    }
    return (
        StatusCode::CONFLICT,
        "{\"error\":\"Username already taken up for tag.\"}"
    ).into_response();
}

pub async fn change_tag_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<member::NewTag>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // change tag
    let id = auth_result.unwrap().id;
    if member::change_tag(&client, id, body.new_tag).await {
        return (
            StatusCode::OK,
            "{\"result\":\"Successful.\"}"
        ).into_response();
    }
    return (
        StatusCode::CONFLICT,
        "{\"error\":\"Username and tag combination already taken up.\"}"
    ).into_response();
}
