use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse};
use http::{HeaderMap, StatusCode};
use tokio_postgres::Client;

use crate::service::{auth, direct_message};

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
