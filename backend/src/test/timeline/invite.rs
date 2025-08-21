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

    #[tokio::test]
    async fn can_join_timeline_from_invite() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let ruby: Credentials = Credentials {
            email: "ruby@example.com".to_string(),
            password: "star".to_string()
        };
        let ruby_jwt = login(&server, &ruby).await;
        let chocomint_input = TimelineInput {
            name: "Chocolate Mint".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .json::<TimelineInput>(&chocomint_input)
            .await
            .json::<Timeline>()
            .id;
        let invite_code = server.post("/invite/")
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .json::<InviteInput>(&InviteInput { timeline: timeline_id.clone() })
            .await
            .json::<InviteCode>()
            .code;
        let ruby2: Credentials = Credentials {
            email: "ruby2@example.com".to_string(),
            password: "star".to_string()
        };
        let ruby2_jwt = login(&server, &ruby2).await;
        server.put(&format!("/invite/{}/", &invite_code))
            .add_header("Authorization", format!("jwt {}", ruby2_jwt))
            .await
            .assert_status_ok();
        let timeline_list = server.get("/timeline/")
            .add_header("Authorization", format!("jwt {}", ruby2_jwt))
            .await
            .json::<Vec<Timeline>>();
        assert_eq!(timeline_list.len(), 1);
    }

    #[tokio::test]
    async fn cant_join_timeline_if_already_in() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let luna: Credentials = Credentials {
            email: "luna@example.com".to_string(),
            password: "princess".to_string()
        };
        let luna_jwt = login(&server, &luna).await;
        let timeline_input = TimelineInput {
            name: "Candy".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", luna_jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .id;
        let invite_code = server.post("/invite/")
            .add_header("Authorization", format!("jwt {}", luna_jwt))
            .json::<InviteInput>(&InviteInput { timeline: timeline_id.clone() })
            .await
            .json::<InviteCode>()
            .code;
        server.put(&format!("/invite/{}/", &invite_code))
            .add_header("Authorization", format!("jwt {}", luna_jwt))
            .await
            .assert_status_forbidden();
    }

    #[tokio::test]
    async fn invalid_invite() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let dan: Credentials = Credentials {
            email: "dan1@example.com".to_string(),
            password: "composer".to_string()
        };
        let dan_jwt = login(&server, &dan).await;
        let invite_code = "1";
        server.put(&format!("/invite/{}/", &invite_code))
            .add_header("Authorization", format!("jwt {}", dan_jwt))
            .await
            .assert_status_not_found();
    }
}
