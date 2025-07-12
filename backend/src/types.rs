use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

#[derive(PartialEq)]
pub enum RegistrationError {
    UsernameError,
    RegistrationError
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RegisterInfo {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Member {
    pub id: String,
    pub username: String,
    pub tag: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct UserJwt {
    pub id: String,
    pub username: String,
    pub tag: String,
    pub exp: i64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FriendRequest {
    pub username: String,
    pub tag: String
}

pub enum FriendRequestError {
    FriendNotExists,  // also encodes blocked
    FriendRequestExists,
    AlreadyFriends
}
