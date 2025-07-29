#[cfg(test)]
mod send_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};

    use crate::app;
    use crate::types::{Credentials, DirectMessage, IdField, Member, Message, MessageInput};

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
    async fn dan_initiates_dm_with_dan() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let comedian: Credentials = Credentials {
            email: "dan@example.com".to_string(),
            password: "comedian".to_string()
        };
        let composer: Credentials = Credentials {
            email: "dan1@example.com".to_string(),
            password: "composer".to_string()
        };
        let composer_jwt = login(&server, &composer).await;
        let comedian_jwt = login(&server, &comedian).await;
        let comedian_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", comedian_jwt))
            .await
            .json::<Member>()
            .id;
        let dm_request = IdField {
            id: comedian_id
        };
        server.post("/direct-message/")
            .add_header("Authorization", format!("jwt {}", composer_jwt))
            .json::<IdField>(&dm_request)
            .await
            .assert_status_success();
        let messages = server.get("/direct-message/")
            .add_header("Authorization", format!("jwt {}", composer_jwt))
            .json::<IdField>(&dm_request)
            .await
            .json::<Vec<DirectMessage>>();
        assert!(messages.len() >= 1);

    }

    #[tokio::test]
    async fn dan_initiates_twice() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let comedian: Credentials = Credentials {
            email: "dan@example.com".to_string(),
            password: "comedian".to_string()
        };
        let roa: Credentials = Credentials {
            email: "roa@example.com".to_string(),
            password: "jellyfish".to_string()
        };
        let roa_jwt = login(&server, &roa).await;
        let comedian_jwt = login(&server, &comedian).await;
        let comedian_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", comedian_jwt))
            .await
            .json::<Member>()
            .id;
        let dm_request = IdField {
            id: comedian_id
        };
        server.post("/direct-message/")
            .add_header("Authorization", format!("jwt {}", roa_jwt))
            .json::<IdField>(&dm_request)
            .await;
        server.post("/direct-message/")
            .add_header("Authorization", format!("jwt {}", roa_jwt))
            .json::<IdField>(&dm_request)
            .await
            .assert_status_conflict();
    }

    #[tokio::test]
    async fn ruby_sends_message_to_polka_can_see_message() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let ruby: Credentials = Credentials {
            email: "ruby@example.com".to_string(),
            password: "star".to_string()
        };
        let polka: Credentials = Credentials {
            email: "polka@example.com".to_string(),
            password: "performer".to_string()
        };
        let polka_jwt = login(&server, &polka).await;
        let ruby_jwt = login(&server, &ruby).await;
        // get polka's information
        let polka_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", polka_jwt))
            .await
            .json::<Member>()
            .id;
        // initiate dm as ruby
        let dm_request = IdField {
            id: polka_id.clone()
        };
        server.post("/direct-message/")
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .json::<IdField>(&dm_request)
            .await
            .assert_status_success();
        // send dm as ruby
        let message = MessageInput {
            content: "hello world".to_string()
        };
        server.post(&format!("/direct-message/{}/", polka_id))
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .json::<MessageInput>(&message)
            .await
            .assert_status_success();
        let dm_messages = server.get(&format!("/direct-message/{}/", polka_id))
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .await
            .json::<Vec<Message>>();
        assert!(dm_messages.len() >= 1);
    }

    #[tokio::test]
    async fn ruby_sends_message_to_uninitialized_member() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let ruby: Credentials = Credentials {
            email: "ruby@example.com".to_string(),
            password: "star".to_string()
        };
        let imaginary: Credentials = Credentials {
            email: "imaginary@example.com".to_string(),
            password: "friend".to_string()
        };
        let imaginary_jwt = login(&server, &imaginary).await;
        let ruby_jwt = login(&server, &ruby).await;
        // get imaginary friend information
        let imaginary_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", imaginary_jwt))
            .await
            .json::<Member>()
            .id;
        // send dm as ruby
        let message = MessageInput {
            content: "hello world".to_string()
        };
        server.post(&format!("/direct-message/{}/", imaginary_id))
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .json::<MessageInput>(&message)
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn ruby_initiates_dm_with_someone_unknown() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let ruby: Credentials = Credentials {
            email: "ruby@example.com".to_string(),
            password: "star".to_string()
        };
        let ruby_jwt = login(&server, &ruby).await;
        // initiate dm as ruby
        let dm_request = IdField {
            id: "00000000-0000-0000-0000-000000000000".to_owned()
        };
        server.post("/direct-message/")
            .add_header("Authorization", format!("jwt {}", ruby_jwt))
            .json::<IdField>(&dm_request)
            .await
            .assert_status_not_found();
    }
}
