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

#[derive(Serialize, Deserialize, Clone)]
pub struct Timeline {
    pub id: String,
    pub name: String,
    pub owner: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TimelineInput {
    pub name: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Channel {
    pub id: String,
    pub name: String,
    pub timeline: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: String,
    pub location: String,
    pub sender: Member,
    pub content: String,
    pub time_sent: String,
    pub edited: bool
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MessageInput {
    pub content: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DirectMessage {
    pub id: String,
    pub sender: String,
    pub receiver: Member
}

#[derive(Serialize, Deserialize, Clone)]
pub struct IdField {
    pub id: String
}
