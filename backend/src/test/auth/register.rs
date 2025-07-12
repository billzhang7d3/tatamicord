#[cfg(test)]
mod login_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::service::auth::{Credentials, RegisterInfo};
    use crate::app;

    #[derive(Serialize, Deserialize)]
    struct LoginResponse {
        result: String
    }

    #[tokio::test]
    async fn invalid_login() {
        dotenv::dotenv().ok();
        let amelia: Credentials = Credentials {
            email: "amelia@example.com".to_string(),
            password: "detective".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        let response = server.post("/login/")
            .json::<Credentials>(&amelia)
            .await;
        assert_eq!(response.status_code(), 401);
    }

    #[tokio::test]
    async fn register_chloe() {
        dotenv::dotenv().ok();
        // first we register
        let chloe_register: RegisterInfo = RegisterInfo  {
            username: "chloe".to_string(),
            email: "chloe@example.com".to_string(),
            password: "whale".to_string()
        };
        let chloe_login: Credentials = Credentials  {
            email: "chloe@example.com".to_string(),
            password: "whale".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        let response = server.post("/register/")
            .json::<RegisterInfo>(&chloe_register)
            .await;
        assert_eq!(response.status_code(), 200);
        // then we login and it works
        let response = server.post("/login/")
            .json::<Credentials>(&chloe_login)
            .await;
        assert_eq!(response.status_code(), 200);
    }

    #[tokio::test]
    async fn duplicate_email_not_allowed() {
        dotenv::dotenv().ok();
        let kiara_register: RegisterInfo = RegisterInfo  {
            username: "kiara".to_string(),
            email: "kiara@example.com".to_string(),
            password: "phoenix".to_string()
        };
        let server = TestServer::new(app::create_app().await).unwrap();
        server.post("/register/")
            .json::<RegisterInfo>(&kiara_register)
            .await
            .assert_status_forbidden();
    }

    // #[tokio::test]
    // async fn test_tag_limit() {
    //     dotenv::dotenv().ok();
    //     let server = TestServer::new(app::create_app().await).unwrap();
    //     for i in 0..10000 {
    //         let account: RegisterInfo = RegisterInfo {
    //             username: "aqua".to_string(),
    //             email: format!("aqua{}@example.com", i),
    //             password: "aqua".to_string()
    //         };
    //         server.post("/register/")
    //             .json::<RegisterInfo>(&account)
    //             .await
    //             .assert_status_ok();
    //     }
    //     let account: RegisterInfo = RegisterInfo {
    //         username: "aqua".to_string(),
    //         email: "aqua@example.com".to_string(),
    //         password: "aqua".to_string()
    //     };
    //     server.post("/register/")
    //         .json::<RegisterInfo>(&account)
    //         .await
    //         .assert_status_not_ok();
    // }
}

