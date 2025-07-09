use crate::service::{auth, member};

use axum::{
    extract::{Path, State}, http::StatusCode, response::IntoResponse, Json
};
use http::HeaderMap;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio_postgres::Client;

#[derive(Serialize, Deserialize, Clone)]
pub struct Member {
    pub id: String,  // will be encrypted
    pub username: String,
    pub tag: String
}

pub async fn get_info(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(client): State<Arc<Client>>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    let final_id = if id == "self" { auth_result.unwrap().id } else {id} ;
    // get user info
    return match member::get_info(&client, final_id).await {
        Some(user) => (
            StatusCode::OK,
            serde_json::to_string(&user).unwrap()
        ).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response()
    }
}

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
