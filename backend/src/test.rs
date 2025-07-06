#[cfg(test)]
mod login_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::service::login::{Credentials, RegisterInfo};
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

    // #[tokio::test]
    // async fn register_chloe() {
    //     dotenv::dotenv().ok();
    //     // first we register
    //     let chloe_register: RegisterInfo = RegisterInfo  {
    //         username: "chloe".to_string(),
    //         email: "chloe@example.com".to_string(),
    //         password: "whale".to_string()
    //     };
    //     let chloe_login: Credentials = Credentials  {
    //         email: "chloe@example.com".to_string(),
    //         password: "whale".to_string()
    //     };
    //     let server = TestServer::new(app::create_app().await).unwrap();
    //     let response = server.post("/register/")
    //         .json::<RegisterInfo>(&chloe_register)
    //         .await;
    //     assert_eq!(response.status_code(), 200);
    //     // then we login and it works
    //     let response = server.post("/login/")
    //         .json::<Credentials>(&chloe_login)
    //         .await;
    //     assert_eq!(response.status_code(), 200);
    // }

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

#[cfg(test)]
mod member_change_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::service::login::{Credentials};
    use crate::service::member::{NewUsername};
    use crate::app;

    #[derive(Serialize, Deserialize)]
    struct LoginResponse {
        result: String
    }
    #[derive(Serialize, Deserialize)]
    struct NewTag {
        new_tag: String
    }

    async fn login(server: &TestServer, credentials: &Credentials) -> String {
        let response = server.post("/login/")
            .json::<Credentials>(&credentials)
            .await
            .json::<LoginResponse>();
        return response.result;
    }

    #[tokio::test]
    async fn bill_changes_name_to_william() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        let new_name = NewUsername {
            new_username: "william".to_string()
        };
        let response = server.put("/username/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<NewUsername>(&new_name)
            .await;
        assert_eq!(response.status_code(), 200);
    }

    #[tokio::test]
    async fn luna_changes_her_tag() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let luna: Credentials = Credentials {
            email: "luna@example.com".to_string(),
            password: "princess".to_string()
        };
        let jwt = login(&server, &luna).await;
        let new_tag = NewTag {
            new_tag: "2020".to_string()
        };
        let response = server.put("/tag/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<NewTag>(&new_tag)
            .await;
        assert_eq!(response.status_code(), 200);
    }

    #[tokio::test]
    async fn ruby_reserves_tag() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let ruby: Credentials = Credentials {
            email: "ruby@example.com".to_string(),
            password: "star".to_string()
        };
        let ruby2: Credentials = Credentials {
            email: "ruby2@example.com".to_string(),
            password: "star".to_string()
        };
        let jwt1 = login(&server, &ruby).await;
        let new_tag = NewTag {
            new_tag: "2022".to_string()
        };
        let response = server.put("/tag/")
            .add_header("Authorization", format!("jwt {}", jwt1))
            .json::<NewTag>(&new_tag)
            .await;
        assert_eq!(response.status_code(), 200);
        let jwt2 = login(&server, &ruby2).await;
        let new_tag = NewTag {
            new_tag: "2022".to_string()
        };
        server.put("/tag/")
            .add_header("Authorization", format!("jwt {}", jwt2))
            .json::<NewTag>(&new_tag)
            .await
            .assert_status_conflict();
    }
}

#[cfg(test)]
mod friend_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};
    use crate::service::login::{Credentials};

    use crate::app;

    #[derive(Serialize, Deserialize)]
    struct LoginCredentials {
        email: String,
        password: String
    }
    #[derive(Serialize, Deserialize)]
    struct LoginResponse {
        result: String
    }

    async fn login(server: &TestServer, credentials: &Credentials) -> String {
        let response = server.post("/login/")
            .json::<Credentials>(&credentials)
            .await
            .json::<LoginResponse>();
        return response.result;
    }

    #[tokio::test]
    async fn get_friends_list_no_auth() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        server.get("/friends/")
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn get_friends_list_no_auth_type() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        // login as noel
        let noel: Credentials = Credentials {
            email: "noel@example.com".to_string(),
            password: "knight".to_string()
        };
        let jwt = login(&server, &noel).await;
        server.get("/friends/")
            .add_header("Authorization", jwt)
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn noel_gets_empty_friends_list() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        // login as noel
        let noel: Credentials = Credentials {
            email: "noel@example.com".to_string(),
            password: "knight".to_string()
        };
        let jwt = login(&server, &noel).await;
        server.get("/friends/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_ok();
    }

    // #[tokio::test]
    // async fn luna_sends_fr_to_noel() {
    //     dotenv::dotenv().ok();
    //     let server = TestServer::new(app::create_app().await).unwrap();
    //     // login as noel
    //     let noel: Credentials = Credentials {
    //         email: "noel@example.com".to_string(),
    //         password: "knight".to_string()
    //     };
    //     let noel_jwt = login(&server, &noel).await;
    //     // login as luna
    //     let noel: Credentials = Credentials {
    //         email: "noel@example.com".to_string(),
    //         password: "knight".to_string()
    //     };
    //     let luna_jwt = login(&server, &noel).await;

    // }
}
