use axum::{
    routing::{get, post},
    Router
};
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use std::{
    sync::Arc,
    env
};
use tokio_postgres::{Client, Config, NoTls};
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};

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
        .allow_origin(Any);
    let client_arc = Arc::new(create_client().await);
    let client_clone = Arc::clone(&client_arc);
    return Router::new()
        .route("/register/", post(handlers::register_handler))
        .route("/login/", post(handlers::login_handler))
        .route("/friends/", get(handlers::get_friends_handler))
        .with_state(client_clone)
        .layer(ServiceBuilder::new()
            .layer(cors));
        // .layer(TraceLayer::new_for_http())
    // TODO: make middleware actually good
}
