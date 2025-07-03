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
        let amelia: LoginCredentials = LoginCredentials {
            email: "amelia@example.com".to_string(),
            password: "detective".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        let response = server.post("/login/")
            .json::<LoginCredentials>(&amelia)
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
    #[tokio::test]
    async fn duplicate_email_not_allowed() {
        dotenv::dotenv().ok();
        let kiara_register: RegisterCredentials = RegisterCredentials  {
            username: "kiara".to_string(),
            email: "kiara@example.com".to_string(),
            password: "phoenix".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        server.post("/register/")
            .json::<RegisterCredentials>(&kiara_register)
            .await
            .assert_status_ok();
        server.post("/register/")
            .json::<RegisterCredentials>(&kiara_register)
            .await
            .assert_status_not_ok();
    }
    #[tokio::test]
    async fn test_tag_limit() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        for i in 0..10000 {
            let account: RegisterCredentials = RegisterCredentials {
                username: "aqua".to_string(),
                email: format!("aqua{}@example.com", i),
                password: "aqua".to_string()
            };
            server.post("/register/")
                .json::<RegisterCredentials>(&account)
                .await
                .assert_status_ok();
        }
        let account: RegisterCredentials = RegisterCredentials {
            username: "aqua".to_string(),
            email: "aqua@example.com".to_string(),
            password: "aqua".to_string()
        };
        server.post("/register/")
            .json::<RegisterCredentials>(&account)
            .await
            .assert_status_not_ok();
    }
}
