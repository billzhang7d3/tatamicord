#[cfg(test)]
mod friend_tests {
    use axum_test::TestServer;
    use serde::{Serialize, Deserialize};
    use crate::types::{Credentials, FriendRequest, Member};

    use crate::app;
    use crate::service::member::NewTag;

    #[derive(Serialize, Deserialize)]
    struct LoginCredentials {
        email: String,
        password: String
    }
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
    async fn get_friends_list_no_auth() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        server.get("/friend/")
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn get_friends_list_no_auth_type() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        // login as bill
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.get("/friend/")
            .add_header("Authorization", jwt)
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn bill_gets_empty_friends_list() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        // login as bill
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.get("/friend/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn bill_gets_empty_incoming_fr_list() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.get("/incoming-friend-requests/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn bill_gets_empty_outgoing_fr_list() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.get("/outgoing-friend-requests/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn luna_sends_fr_to_noel() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        // login as noel
        let noel: Credentials = Credentials {
            email: "noel@example.com".to_string(),
            password: "knight".to_string()
        };
        let noel_jwt = login(&server, &noel).await;
        // change noel's tag
        let new_tag = NewTag {
            new_tag: "2019".to_string()
        };
        server.put("/tag/")
            .add_header("Authorization", format!("jwt {}", noel_jwt))
            .json::<NewTag>(&new_tag)
            .await
            .assert_status_ok();
        // login as luna
        let luna: Credentials = Credentials {
            email: "luna@example.com".to_string(),
            password: "princess".to_string()
        };
        let luna_jwt = login(&server, &luna).await;
        // send fr to noel
        let friend_request = FriendRequest {
            username: "noel".to_string(),
            tag: "2019".to_string()
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", luna_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        // noel can see someone on her friends list
        let noel_jwt = login(&server, &noel).await;
        let response = server.get("/incoming-friend-requests/")
            .add_header("Authorization", format!("jwt {}", noel_jwt))
            .await
            .json::<Vec<Member>>();
        assert_ne!(response.len(), 0);
    }

    #[tokio::test]
    async fn violet_accepts_fr_from_cecilia() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let violet: Credentials = Credentials {
            email: "violet@example.com".to_string(),
            password: "transcriber".to_string()
        };
        let cecilia: Credentials = Credentials {
            email: "cecilia@example.com".to_string(),
            password: "doll".to_string()
        };
        let cecilia_jwt = login(&server, &cecilia).await;
        let violet_jwt = login(&server, &violet).await;
        // change violet tag
        let new_tag = NewTag {
            new_tag: "2018".to_string()
        };
        server.put("/tag/")
            .add_header("Authorization", format!("jwt {}", violet_jwt))
            .json::<NewTag>(&new_tag)
            .await
            .assert_status_ok();
        // cecilia gets her own id
        let cecilia_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", cecilia_jwt))
            .await
            .json::<Member>()
            .id;
        // cecilia sends a fr
        let friend_request = FriendRequest {
            username: "violet".to_string(),
            tag: "2018".to_string()
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", cecilia_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        // violet accepts fr
        server.put(&format!("/friend-request/{}/", cecilia_id))
            .add_header("Authorization", format!("jwt {}", violet_jwt))
            .await
            .assert_status_ok();
        // violet can see friendship
        let response = server.get("/friend/")
            .add_header("Authorization", format!("jwt {}", violet_jwt))
            .await
            .json::<Vec<Member>>();
        assert_eq!(response.len(), 1);
    }

    #[tokio::test]
    async fn cant_send_fr_if_friends() {
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
        let comedian_jwt = login(&server, &comedian).await;
        let composer_jwt = login(&server, &composer).await;
        // dan finds out what his tag is
        let composer_tag = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", composer_jwt))
            .await
            .json::<Member>()
            .tag;
        // dan gets his own id
        let comedian_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", comedian_jwt))
            .await
            .json::<Member>()
            .id;
        // dan sends a fr
        let friend_request = FriendRequest {
            username: "dan".to_string(),
            tag: composer_tag
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", comedian_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        // dan sees his outgoing friend requests
        let response = server.get("/outgoing-friend-requests/")
            .add_header("Authorization", format!("jwt {}", comedian_jwt))
            .await
            .json::<Vec<Member>>();
        assert_eq!(response.len(), 1);
        // dan accepts fr
        server.put(&format!("/friend-request/{}/", comedian_id))
            .add_header("Authorization", format!("jwt {}", composer_jwt))
            .await
            .assert_status_ok();
        // dan sends fr again
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", comedian_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_forbidden();
    }
    #[tokio::test]
    async fn cant_send_fr_if_pending() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let choco: Credentials = Credentials {
            email: "choco@example.com".to_string(),
            password: "nurse".to_string()
        };
        let polka: Credentials = Credentials {
            email: "polka@example.com".to_string(),
            password: "performer".to_string()
        };
        let choco_jwt = login(&server, &choco).await;
        let polka_jwt = login(&server, &polka).await;
        // choco finds out what her tag is
        let choco_tag = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", choco_jwt))
            .await
            .json::<Member>()
            .tag;
        // polka sends a fr
        let friend_request = FriendRequest {
            username: "choco".to_string(),
            tag: choco_tag
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", polka_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        // polka sends fr again
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", polka_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_conflict();
    }

    #[tokio::test]
    async fn send_to_nonexistent_friend() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let friend_request = FriendRequest {
            username: "zhang".to_string(),
            tag: "8888".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn accept_a_nonexistent_fr() {
        dotenv::dotenv().ok();
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.put("/friend-request/00000000-0000-0000-0000-000000000000/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn revoke_a_fr() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let john: Credentials = Credentials {
            email: "titor@example.com".to_string(),
            password: "troll".to_string()
        };
        let bill_jwt = login(&server, &bill).await;
        let john_jwt = login(&server, &john).await;
        // send FR to john
        let john_info = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", john_jwt))
            .await
            .json::<Member>();
        let friend_request = FriendRequest {
            username: "john".to_string(),
            tag: john_info.tag
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", bill_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        server.delete(&format!("/friend-request/{}/", john_info.id))
            .add_header("Authorization", format!("jwt {}", bill_jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn deny_a_fr() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let christina: Credentials = Credentials {
            email: "christina@example.com".to_string(),
            password: "tsundere".to_string()
        };
        let bill_jwt = login(&server, &bill).await;
        let christina_jwt = login(&server, &christina).await;
        // send FR to christina
        let christina_tag = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", christina_jwt))
            .await
            .json::<Member>()
            .tag;
        let bill_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", bill_jwt))
            .await
            .json::<Member>()
            .id;
        let friend_request = FriendRequest {
            username: "christina".to_string(),
            tag: christina_tag
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", bill_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        server.delete(&format!("/friend-request/{}/", bill_id))
            .add_header("Authorization", format!("jwt {}", christina_jwt))
            .await
            .assert_status_ok();
    }

    #[tokio::test]
    async fn delete_a_nonexistent_fr() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.delete("/friend-request/00000000-0000-0000-0000-000000000000/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_not_found();
    }

    #[tokio::test]
    async fn christina_deletes_imaginary_as_friend() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let christina: Credentials = Credentials {
            email: "christina@example.com".to_string(),
            password: "tsundere".to_string()
        };
        let imaginary: Credentials = Credentials {
            email: "imaginary@example.com".to_string(),
            password: "friend".to_string()
        };
        let christina_jwt = login(&server, &christina).await;
        let imaginary_jwt = login(&server, &imaginary).await;
        let imaginary_info = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", imaginary_jwt))
            .await
            .json::<Member>();
        let christina_id = server.get("/userinfo/self/")
            .add_header("Authorization", format!("jwt {}", christina_jwt))
            .await
            .json::<Member>()
            .id;
        let friend_request = FriendRequest {
            username: "imaginary".to_string(),
            tag: imaginary_info.tag
        };
        server.post("/friend-request/")
            .add_header("Authorization", format!("jwt {}", christina_jwt))
            .json::<FriendRequest>(&friend_request)
            .await
            .assert_status_ok();
        server.put(&format!("/friend-request/{}/", christina_id))
            .add_header("Authorization", format!("jwt {}", imaginary_jwt))
            .await
            .assert_status_ok();
        let friend_list1 = server.get("/friend/")
            .add_header("Authorization", format!("jwt {}", christina_jwt))
            .await
            .json::<Vec<Member>>();
        assert_eq!(friend_list1[0].id, imaginary_info.id);
        server.delete(&format!("/friend/{}/", christina_id))
            .add_header("Authorization", format!("jwt {}", imaginary_jwt))
            .await
            .assert_status_ok();
        let friend_list2 = server.get("/friend/")
            .add_header("Authorization", format!("jwt {}", christina_jwt))
            .await
            .json::<Vec<Member>>();
        assert_eq!(friend_list2.len(), 0);
    }

    #[tokio::test]
    async fn delete_a_nonexistent_friend() {
        let server = TestServer::new(app::create_app().await).unwrap();
        let bill: Credentials = Credentials {
            email: "bill@example.com".to_string(),
            password: "scientist".to_string()
        };
        let jwt = login(&server, &bill).await;
        server.delete("/friend/00000000-0000-0000-0000-000000000000/")
            .add_header("Authorization", format!("jwt {}", jwt))
            .await
            .assert_status_not_found();
    }
}

