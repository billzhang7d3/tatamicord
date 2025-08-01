export interface Member {
    id: string
    username: string
    tag: string
}

export interface Timeline {
    id: string
    name: string
}

export interface FriendRequestInfo {
    username: string
    tag: string
}

export interface DirectMessageInfo {
    id: string
    sender: string
    receiver: Member
}

export interface Message {
    id: string
    location: string
    sender: Member
    content: string
    time_sent: string
    edited: boolean
}
