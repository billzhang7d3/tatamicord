#[cfg(test)]
mod login_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;

    #[derive(Serialize, Deserialize)]
    struct LoginCredentials {
        email: String,
        password: String
    }
    #[derive(Serialize, Deserialize)]
    struct RegisterCredentials {
        username: String,
        email: String,
        password: String
    }

    #[tokio::test]
    async fn invalid_login() {
        dotenv::dotenv().ok();
        let chloe: LoginCredentials = LoginCredentials {
            email: "chloe@example.com".to_string(),
            password: "whale".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        let response = server.post("/login/")
            .json::<LoginCredentials>(&chloe)
            .await;
        assert_eq!(response.status_code(), 401);
    }
    #[tokio::test]
    async fn register_chloe() {
        dotenv::dotenv().ok();
        // first we register
        let chloe_register: RegisterCredentials = RegisterCredentials  {
            username: "chloe".to_string(),
            email: "chloe@example.com".to_string(),
            password: "whale".to_string()
        };
        let chloe_login: LoginCredentials = LoginCredentials  {
            email: "chloe@example.com".to_string(),
            password: "whale".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        let response = server.post("/register/")
            .json::<RegisterCredentials>(&chloe_register)
            .await;
        assert_eq!(response.status_code(), 200);
        // then we login and it works
        let response = server.post("/login/")
            .json::<LoginCredentials>(&chloe_login)
            .await;
        assert_eq!(response.status_code(), 200);
    }
}
