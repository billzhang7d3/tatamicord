use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse, Json};
use http::{HeaderMap, StatusCode};
use tokio_postgres::Client;

use crate::{service::{auth, direct_message}, types::{IdField, MessageInput}};

pub async fn get_dm_list_handler(
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
    // fetch dm list
    let id = auth_result.unwrap().id;
    let dm_list = direct_message::get_dm_list(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&dm_list).unwrap()
    ).into_response();
}

pub async fn get_dm_messages_handler(
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
    // fetch dm
    let id1 = auth_result.unwrap().id;
    let id2 = id;
    let message_list = direct_message::get_dm_messages(&client, id1, id2).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&message_list).unwrap()
    ).into_response();
}

pub async fn initiate_dm_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<IdField>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // send dm
    let sender = auth_result.unwrap().id;
    let receiver = body.id;
    let dm_init_result = direct_message::initiate_dm(&client, sender, receiver).await;
    return match dm_init_result {
        Ok(id) =>
            (StatusCode::OK, format!("{{\"result\":\"{}\"}}", id)).into_response(),
        Err(err) => {
            let status_code = if err.to_string() == "query returned an unexpected number of rows"
                { StatusCode::CONFLICT } else { StatusCode::NOT_FOUND };
            return (
                status_code,
                format!("{{\"error\":\"{}\"}}", err.to_string())
            ).into_response()
        }
    }
}

pub async fn send_dm_handler(
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
    // send dm
    let sender = auth_result.unwrap().id;
    let receiver = id;
    let message_result =
        direct_message::send_dm(&client, sender, receiver, body.content)
        .await;
    return match message_result {
        Ok(message) => (
            StatusCode::OK,
            serde_json::to_string(&message).unwrap()
        ).into_response(),
        Err(_err) => (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Message could not be sent.\"}"
        ).into_response()
    };
}
