use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse};
use http::{HeaderMap, StatusCode};
use tokio_postgres::Client;

use crate::service::{auth, channel};


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