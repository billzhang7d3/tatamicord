#[cfg(test)]
mod basic_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Credentials, Timeline};

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
    async fn dan_not_in_any_timelines() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let dan: Credentials = Credentials {
            email: "dan1@example.com".to_string(),
            password: "composer".to_string()
        };
        let jwt = login(&server, &dan).await;
        let timelines = server.get("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Timeline>>();
        assert_eq!(timelines.len(), 0);
    }

    // #[tokio::test]
    // async fn cecilia_joins_ramen_timeline() {
    //     dotenv::dotenv().ok();
    //     let server = TestServer::new(app::create_app().await).unwrap();
    //     let cecilia: Credentials = Credentials {
    //         email: "cecilia@example.com".to_string(),
    //         password: "doll".to_string()
    //     };
    //     let jwt = login(&server, &cecilia).await;
    //     let timelines = server.get("/timeline/")
    //         .add_header("Authorization", format!("jwt {}", jwt))
    //         .await
    //         .json::<Vec<Timeline>>();
    //     assert_eq!(timelines.len(), 1);
    // }
}