#[cfg(test)]
mod channel_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Channel, Credentials, Message, MessageInput, Timeline, TimelineInput};

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
    async fn getting_messages_works() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let luna: Credentials = Credentials {
            email: "luna@example.com".to_string(),
            password: "princess".to_string()
        };
        let jwt = login(&server, &luna).await;
        // create timeline and get channel first
        let timeline_input = TimelineInput {
            name: "COBOL Enjoyers".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .id;
        let channel_list = server.get(&format!("/channel/{}/", timeline_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Channel>>();
        let channel_id = &channel_list[0].id;
        // get messages
        let messages = server.get(&format!("/messages/{}/", channel_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Message>>();
        assert_eq!(messages.len(), 0);
    }

    // need to add test for if user is allowed to see channel
    #[tokio::test]
    async fn unauthorized_channel_messaages_access() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let choco: Credentials = Credentials {
            email: "choco@example.com".to_string(),
            password: "nurse".to_string()
        };
        let choco_jwt = login(&server, &choco).await;
        // create timeline and get channel first
        let timeline_input = TimelineInput {
            name: "Syringes".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", choco_jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .id;
        let channel_list = server.get(&format!("/channel/{}/", timeline_id))
            .add_header("Authorization", format!("jwt {}", choco_jwt))
            .await
            .json::<Vec<Channel>>();
        let channel_id = &channel_list[0].id;
        let roa: Credentials = Credentials {
            email: "roa@example.com".to_owned(),
            password: "jellyfish".to_owned()
        };
        let roa_jwt = login(&server, &roa).await;
        // get messages
        server.get(&format!("/messages/{}/", channel_id))
            .add_header("Authorization", format!("jwt {}", roa_jwt))
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn sending_a_message_works() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let roa: Credentials = Credentials {
            email: "roa@example.com".to_string(),
            password: "jellyfish".to_string()
        };
        let jwt = login(&server, &roa).await;
        // create timeline and get channel first
        let timeline_input = TimelineInput {
            name: "Dolphin Consciousness".to_owned()
        };
        let timeline_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .id;
        let channel_list = server.get(&format!("/channel/{}/", timeline_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .json::<Vec<Channel>>();
        let channel_id = &channel_list[0].id;
        // send message
        let message = MessageInput {
            content: "I'm your senpai now".to_owned()
        };
        server.post(&format!("/message/{}/", channel_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<MessageInput>(&message)
            .await
            .assert_status_success();
    }

    #[tokio::test]
    async fn sending_a_message_to_nonexistent_channel() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let roa: Credentials = Credentials {
            email: "roa@example.com".to_string(),
            password: "jellyfish".to_string()
        };
        let jwt = login(&server, &roa).await;
        let channel_id = "00000000-0000-0000-0000-000000000000";
        // send message
        let message = MessageInput {
            content: "I'm your senpai now".to_owned()
        };
        server.post(&format!("/message/{}/", channel_id))
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<MessageInput>(&message)
            .await
            .assert_status_not_found();
    }

    // user not in timeline -> also 404
    #[tokio::test]
    async fn sending_a_message_but_user_not_in_timeline() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let roa: Credentials = Credentials {
            email: "roa@example.com".to_string(),
            password: "jellyfish".to_string()
        };
        let roa_jwt = login(&server, &roa).await;
        // create timeline and get channel first
        let timeline_input = TimelineInput {
            name: "Dolphin Consciousness".to_owned()
        };
        let channel_id = server.post("/timeline/")
            .add_header("Authorization", format!("jwt {}", roa_jwt))
            .json::<TimelineInput>(&timeline_input)
            .await
            .json::<Timeline>()
            .default_channel;
        let polka: Credentials = Credentials {
            email: "polka@example.com".to_string(),
            password: "performer".to_string()
        };
        let polka_jwt = login(&server, &polka).await;
        // send message
        let message = MessageInput {
            content: "I'm your senpai now".to_owned()
        };
        server.post(&format!("/message/{}/", channel_id))
            .add_header("Authorization", format!("jwt {}", polka_jwt))
            .json::<MessageInput>(&message)
            .await
            .assert_status_not_found();
    }


}
