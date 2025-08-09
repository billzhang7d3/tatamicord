#[cfg(test)]
mod basic_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Channel, ChannelInput, Credentials, Timeline, TimelineInput};

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
    async fn get_channels_works_with_proper_timeline() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let kiara: Credentials = Credentials {
            email: "kiara@example.com".to_string(),
            password: "phoenix".to_string()
        };
        let jwt = login(&server, &kiara).await;
        // create timeline first
        let timeline_input = TimelineInput {
            name: "Fried Chicken".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .id;
        let channels = server.get(&format!("/channel/{}/", timeline_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Channel>>();
        assert_eq!(channels.len(), 1);
    }

    #[tokio::test]
    async fn owner_can_create_channel() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let john: Credentials = Credentials {
            email: "titor@example.com".to_string(),
            password: "troll".to_string()
        };
        let jwt = login(&server, &john).await;
        let timeline_input = TimelineInput {
            name: "Time Machine".to_owned()
        };
        let channel_input = ChannelInput {
            name: "IBM 5100".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .id;
        // create a channel with the timeline
        server.post(&format!("/channel/{}/", timeline_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<ChannelInput>(&channel_input)
            .await
            .assert_status_success();
        let channels = server.get(&format!("/channel/{}/", timeline_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Channel>>();
        assert_eq!(channels.len(), 2);
    }

    // have to make permission tests later lol

}

