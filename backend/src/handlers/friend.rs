use crate::service::{auth, friend::{self, send_friend_request, FriendRequestError}};

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse, Json
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

pub async fn get_outgoing_fr_handler(
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
    // get outgoing friend requests
    let id = auth_result.unwrap().id;
    let friends_list: Vec<friend::Friend> = friend::get_outgoing_friend_requests(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&friends_list).unwrap()
    ).into_response();
}

pub async fn send_fr_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<friend::FriendRequest>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // send friend request
    let id = auth_result.unwrap().id;
    match send_friend_request(&client, id, body).await {
        Ok(()) => (
            StatusCode::OK,
            "{\"result\":\"Friend Request Sent.\"}"
        ).into_response(),
        Err(FriendRequestError::AlreadyFriends) => (
            StatusCode::FORBIDDEN,
            "{\"error\":\"Friend Request Forbidden: Already Friends.\"}"
        ).into_response(),
        Err(FriendRequestError::FriendRequestExists) => (
            StatusCode::CONFLICT,
            "{\"error\":\"Friend Request Exists.\"}"
        ).into_response(),
        Err(FriendRequestError::FriendNotExists) => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Friend Not Found.\"}"
        ).into_response()
    }
}

pub async fn accept_fr_handler(
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
    // accept friend request
    let receiver_id = auth_result.unwrap().id;
    return match friend::accept_friend_request(&client, id, receiver_id).await {
        Ok(_) => (
            StatusCode::OK,
            "{\"result\":\"Friend Request Accepted.\"}"
        ).into_response(),
        Err(_err) => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Friend request not found.\"}"
        ).into_response()
    }
}

pub async fn deny_fr_handler(
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
    // deny friend request
    let receiver_id = auth_result.unwrap().id;
    return match friend::delete_friend_request(&client, receiver_id, id).await {
        Ok(_) => (
            StatusCode::OK,
            "{\"result\":\"Friend Request Rejected.\"}"
        ).into_response(),
        Err(_err) => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Friend request not found.\"}"
        ).into_response()
    }
}
