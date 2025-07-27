#[cfg(test)]
mod basic_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Credentials};

    #[derive(Serialize, Deserialize)]
    struct BasicResponse {
        result: String
    }

    async fn login(server: &TestServer, credentials: &Credentials) -> String {
        let response = server.post("/login/")
            .json::<Credentials>(&credentials)
            .await
            .json::<BasicResponse>();
        return response.result;
    }

    #[tokio::test]
    async fn get_dm_list() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.get("/direct-message/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn noel_gets_luna_dms() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let noel: Credentials = Credentials {
            email: "noel@example.com".to_string(),
            password: "knight".to_string()
        };
        let luna: Credentials = Credentials {
            email: "luna@example.com".to_string(),
            password: "princess".to_string()
        };
        let noel_jwt = login(&server, &noel).await;
        let luna_jwt = login(&server, &luna).await;
        server.get(&format!("/direct-message/{}/", luna_jwt))
            .add_header("Authorization", format!("jwt {}", noel_jwt))
            .await
            .assert_status_ok();
    }
}
