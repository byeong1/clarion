export interface IMember {
    sessionId: string;
    name: string;
    role: string;
    joinedAt: string;
}

export interface IMessage {
    from: string;
    fromName: string;
    fromRole: string;
    content: string;
    timestamp: string;
}

export interface IRoom {
    name: string;
    createdAt: string;
    createdBy: string; /* 방 생성자 sessionId */
    members: IMember[];
}
