use crate::service::{friend, auth};

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse
};
use http::HeaderMap;
use std::sync::Arc;
use tokio_postgres::Client;

pub async fn get_friends_handler(
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
    // get friends
    let id = auth_result.unwrap().id;
    let friends_list: Vec<friend::Friend> = friend::get_friends(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&friends_list).unwrap()
    ).into_response();
}

pub async fn get_incoming_fr_handler(
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
    // get incoming friend requests
    let id = auth_result.unwrap().id;
    let friends_list: Vec<friend::Friend> = friend::get_incoming_friend_requests(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&friends_list).unwrap()
    ).into_response();
}
