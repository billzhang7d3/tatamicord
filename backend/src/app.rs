use std::{
    sync::Arc,
    env
};
use axum::{
    routing::{post},
    Router
};
use tokio_postgres::{Client, Config, NoTls};

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
    let client_arc = Arc::new(create_client().await);
    let client_clone = Arc::clone(&client_arc);
    return Router::new()
        .route("/register/", post(handlers::register_handler))
        .route("/login/", post(handlers::login_handler))
        .with_state(client_clone);
        // .layer(TraceLayer::new_for_http())
}
