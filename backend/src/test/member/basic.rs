#[cfg(test)]
mod member_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::handlers::member::Member;
    use crate::service::auth::{Credentials};
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

    #[tokio::test]
    async fn member_get_own_info() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let kiara: Credentials = Credentials {
            email: "kiara@example.com".to_string(),
            password: "phoenix".to_string()
        };
        let jwt = login(&server, &kiara).await;
        server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn choco_get_polka_info() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let polka: Credentials = Credentials {
            email: "polka@example.com".to_string(),
            password: "performer".to_string()
        };
        let polka_jwt = login(&server, &polka).await;
        let polka_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", polka_jwt))
            .await
            .json::<Member>()
            .id;
        // log in as choco to get polka's info
        let choco: Credentials = Credentials {
            email: "choco@example.com".to_string(),
            password: "nurse".to_string()
        };
        let choco_jwt = login(&server, &choco).await;
        server.get(&format!("/userinfo/{}/", polka_id))
            .add_header("Authorization", format!("jwt {}", choco_jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn cant_find_rando_info() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let polka: Credentials = Credentials {
            email: "polka@example.com".to_string(),
            password: "performer".to_string()
        };
        let jwt = login(&server, &polka).await;
        server.get("/userinfo/00000000-0000-0000-0000-000000000000/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_not_found();
    }
}

