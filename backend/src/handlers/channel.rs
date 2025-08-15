use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse, Json};
use http::{HeaderMap, StatusCode};
use tokio_postgres::Client;

use crate::{service::{auth, channel}, types::{ChannelInput, MessageInput}};


pub async fn get_channels_from_timeline_handler(
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
    // fetch channel list
    let channel_list = channel::get_channels_from_timeline(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&channel_list).unwrap()
    ).into_response()
}

pub async fn create_channel_handler(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<ChannelInput>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    let channel = channel::create_channel(&client, body.name, id).await;
    return (
        StatusCode::CREATED,
        serde_json::to_string(&channel).unwrap()
    ).into_response();
}

pub async fn get_messages_handler(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // retrieve messages
    let member_id = auth_result.unwrap().id;
    let messages_result =
        channel::get_all_messages_from_channel(&client, member_id, id)
        .await;
    return match messages_result {
        Ok(messages) => (
            StatusCode::OK,
            serde_json::to_string(&messages).unwrap()
        ).into_response(),
        Err(_err) => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response()
    };
}

pub async fn send_message_handler(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<MessageInput>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // send message
    let sender = auth_result.unwrap().id;
    let channel = id;
    let message_result =
        channel::send_message(&client, sender, channel, body.content)
        .await;
    return match message_result {
        Ok(message) => (
            StatusCode::CREATED,
            serde_json::to_string(&message).unwrap()
        ).into_response(),
        Err(_err) => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Message could not be sent.\"}"
        ).into_response()
    };
}
