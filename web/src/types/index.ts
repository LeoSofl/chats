export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  read: boolean;
  quotedMessage?: Message;
  mentions?: User[];
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}
