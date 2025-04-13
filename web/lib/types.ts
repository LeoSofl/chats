export interface Message {
    _id?: string
    content: string
    sender: {
        name: string
        avatar?: string
    }
    timestamp?: string
    isCurrentUser?: boolean
    mentions?: string[]
    roomId: string
    quote?: {
        messageId: string;
        content: string; // why content? speed up the query and if the message is deleted, the quote will not be deleted
        sender: {
            name: string;
            avatar?: string;
        };
        timestamp: string;
    };
}

export interface Mention {
    _id: string;
    roomId: string;
    messageId: string;  // 引用原消息
    mentionedUser: string;              // 被提及的用户
    mentioningUser: string;             // 提及者
    timestamp: Date;                    // 提及时间
    content: string;                    // 消息预览
    isRead: boolean;                    // 是否已读
}

export interface UnreadCounter {
    _id: string;
    userId: string;                     // 用户ID
    roomId: string;                     // 房间ID
    count: number;                      // 未读数量
    lastReadTimestamp: Date;            // 最后阅读时间
    firstUnreadMessageId?: string; // 第一条未读消息ID
}

export interface Room {
    _id: string;
    name: string;
    lastActivity: Date;
}

export interface UserRoom {
    _id: string;
    userId: string;
    roomId: string;
    lastActivity: Date;
    receiveStatus: 'all' | 'notice' | 'none';
    updatedAt: Date;
    createdAt: Date;
}
