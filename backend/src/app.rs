use axum::{
    routing::{delete, get, post, put},
    Router,
    http::Method
};
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use std::{
    sync::Arc,
    env
};
use tokio_postgres::{Client, Config, NoTls};
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};

// use crate::handlers;
use crate::handlers;

async fn create_client() -> Client {
    let mut configuration = Config::new();
    configuration.host("localhost");
    configuration.port(5432);
    configuration.dbname("tatamicord_db");
    configuration.user(env::var("POSTGRES_USER").unwrap());
    configuration.password(env::var("POSTGRES_PASSWORD").unwrap());
    configuration.application_name("tatamicord_db");

    let (client, connection) = configuration.connect(NoTls)
        .await
        .unwrap();

    tokio::spawn(async move {
        if let Err(err) = connection.await {
            eprintln!("connection error: {}", err);
        }
    });

    return client;
}

pub async fn create_app() -> Router {
    let cors = CorsLayer::new()
        .allow_headers([AUTHORIZATION, CONTENT_TYPE])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin(Any);
    let client_arc = Arc::new(create_client().await);
    let client_clone = Arc::clone(&client_arc);
    return Router::new()
        .route("/register/", post(handlers::auth::register_handler))
        .route("/login/", post(handlers::auth::login_handler))
        .route("/friend/", get(handlers::friend::get_friends_handler))
        .route("/friend/{id}/", delete(handlers::friend::delete_friendship_handler))
        .route("/incoming-friend-requests/", get(handlers::friend::get_incoming_fr_handler))
        .route("/outgoing-friend-requests/", get(handlers::friend::get_outgoing_fr_handler))
        .route("/friend-request/", post(handlers::friend::send_fr_handler))
        .route("/friend-request/{id}/", put(handlers::friend::accept_fr_handler))
        .route("/friend-request/{id}/", delete(handlers::friend::deny_fr_handler))
        .route("/userinfo/{id}/", get(handlers::member::get_info))
        .route("/username/", put(handlers::member::change_username_handler))
        .route("/tag/", put(handlers::member::change_tag_handler))
        .route("/timeline/", get(handlers::timeline::get_timelines_handler))
        .route("/timeline/", post(handlers::timeline::create_timeline_handler))
        .route("/direct-message/", get(handlers::direct_message::get_dm_list_handler))
        .route("/direct-message/", post(handlers::direct_message::initiate_dm_handler))
        .route("/direct-message/{id}/", get(handlers::direct_message::get_dm_messages_handler))
        .route("/direct-message/{id}/", post(handlers::direct_message::send_dm_handler))
        .route("/channel/{id}/", get(handlers::channel::get_channels_from_timeline_handler))
        .route("/channel/{id}/", post(handlers::channel::create_channel_handler))
        .with_state(client_clone)
        .layer(ServiceBuilder::new()
            .layer(cors));
        // .layer(TraceLayer::new_for_http())
    // TODO: make middleware actually good
}
