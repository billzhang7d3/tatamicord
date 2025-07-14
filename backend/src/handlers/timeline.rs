use std::sync::Arc;

use axum::{extract::State, response::IntoResponse};
use http::{HeaderMap, StatusCode};
use tokio_postgres::Client;

use crate::service::{auth, timeline};



pub async fn get_timelines_header(
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
    let id = auth_result.unwrap().id;
    let timelines = timeline::get_timelines(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&timelines).unwrap()
    ).into_response();
}