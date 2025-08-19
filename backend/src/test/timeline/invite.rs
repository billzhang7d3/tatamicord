#[cfg(test)]
mod invite_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Credentials, InviteCode, InviteInput, Timeline, TimelineInput};

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
    async fn can_create_invite_code() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let choco: Credentials = Credentials {
            email: "choco@example.com".to_string(),
            password: "nurse".to_string()
        };
        let jwt = login(&server, &choco).await;
        let horns_input = TimelineInput {
            name: "horns".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<TimelineInput>(&horns_input)
            .await
            .json::<Timeline>()
            .id;
        let invite_code = server.post("/invite/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<InviteInput>(&InviteInput { timeline: timeline_id.clone() })
            .await
            .json::<InviteCode>();
        assert_eq!(invite_code.timeline, timeline_id);
        assert_eq!(invite_code.code.len(), 8);
    }
}