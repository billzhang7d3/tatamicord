mod app;

use std::env;
use dotenv::dotenv;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let port = env::var("PORT").unwrap();
    let listener = tokio::net::TcpListener::bind(format!("localhost:{}", port))
        .await
        .unwrap();
    axum::serve(listener, app::create_app().await)
        .await
        .unwrap();
}
