use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse, Json};
use http::{HeaderMap, StatusCode};
use tokio_postgres::Client;

use crate::{service::{auth, timeline}, types};

pub async fn get_timelines_handler(
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
    // retrieve timelines
    let id = auth_result.unwrap().id;
    let timelines = timeline::get_timelines(&client, id).await;
    return (
        StatusCode::OK,
        serde_json::to_string(&timelines).unwrap()
    ).into_response();
}

pub async fn create_timeline_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<types::TimelineInput>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // create timeline
    let id = auth_result.unwrap().id;
    return match timeline::create_timeline(&client, id, body.name).await {
        Ok(timeline) => (
            StatusCode::OK,
            serde_json::to_string(&timeline).unwrap()
        ).into_response(),
        Err(_err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            "{\"error\":\"Failed to create timeline.\"}"
        ).into_response()
    };
}

pub async fn create_invite_handler(
    headers: HeaderMap,
    State(client): State<Arc<Client>>,
    Json(body): Json<types::InviteInput>
) -> impl IntoResponse {
    // auth
    let auth_result = auth::authenticated(&headers).await;
    if auth_result.is_err() {
        return (
            StatusCode::NOT_FOUND,
            "{\"error\":\"Not Found.\"}"
        ).into_response();
    }
    // create invite link
    return match timeline::create_invite(&client, body.timeline).await {
        Ok(invite_code) => (
            StatusCode::OK,
            serde_json::to_string(&invite_code).unwrap()
        ).into_response(),
        Err(_err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            "{\"error\":\"Failed to create invite.\"}"
        ).into_response()
    }
}

pub async fn join_timeline_handler(
    Path(code): Path<String>,
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
    // join timeline
    let member_id = auth_result.unwrap().id;
    match timeline::join_timeline(&client, code, member_id).await {
        Ok(_) => (
            StatusCode::OK
        ).into_response(),
        Err(err) => {
            let status_code: StatusCode =
                    if err == "invalid invite" {StatusCode::NOT_FOUND}
                    else {StatusCode::FORBIDDEN};
            (status_code, format!("{{\"error\":\"{}.\"}}", err)).into_response()
        }
    }
}
