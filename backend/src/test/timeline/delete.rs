#[cfg(test)]
mod delete_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Credentials, IdField, Timeline, TimelineInput};

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
    async fn can_delete_timeline() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let christina: Credentials = Credentials {
            email: "christina@example.com".to_string(),
            password: "tsundere".to_string()
        };
        let jwt = login(&server, &christina).await;
        let timeline_input = TimelineInput {
            name: "Time Machine".to_owned()
        };
        let timeline = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>();
        server.delete(&format!("/timeline/"))
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<IdField>(&IdField { id: timeline.id })
            .await
            .assert_status_ok();
        let timeline_list = server.get("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Timeline>>();
        assert_eq!(timeline_list.len(), 0);
    }

    #[tokio::test]
    async fn cant_delete_timeline_if_not_owner() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let dan: Credentials = Credentials {
            email: "dan@example.com".to_string(),
            password: "comedian".to_string()
        };
        let dan_jwt = login(&server, &dan).await;
        let timeline_input = TimelineInput {
            name: "Arrowheads".to_owned()
        };
        let timeline = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", dan_jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>();
        let polka: Credentials = Credentials {
            email: "polka@example.com".to_string(),
            password: "performer".to_string()
        };
        let polka_jwt = login(&server, &polka).await;
        server.delete(&format!("/timeline/"))
            .add_header("Authorization", format!("jwt {}", polka_jwt))
            .json::<IdField>(&IdField { id: timeline.id })
            .await
            .assert_status_not_found();
    }

}