import { io, Socket } from 'socket.io-client';
import { getDefaultStore } from 'jotai';
import { mentionedRoomsAtom, RoomMessagesAtom, unreadCountsAtom } from './store/chat';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export interface Message {
  _id?: string
  content: string
  sender: {
    name: string
    avatar?: string
  }
  timestamp?: string
  isCurrentUser?: boolean
  readBy?: string[]
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

let socket: Socket | null = null;
// Jotai 默认 store
const jotaiStore = getDefaultStore();

export const getSocket = (userName: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'],
      auth: { userName }
    });

    // 设置全局事件监听
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // 添加未读消息通知处理
    socket.on('message_notification', (notification: { roomId: string }) => {
      // 使用 Jotai 更新未读消息计数
      jotaiStore.set(unreadCountsAtom, prev => {
        const newCounts = { ...prev };
        newCounts[notification.roomId] = (newCounts[notification.roomId] || 0) + 1;
        return newCounts;
      });
    });

    // 接收所有房间的未读消息计数
    socket.on('unread_counts', (counts: Record<string, number>) => {
      // 使用 Jotai 设置未读消息计数
      jotaiStore.set(unreadCountsAtom, counts);
    });

    socket.on('history_messages', (messages: Message[]) => {
      const formattedMessages = messages.map(msg => ({
        ...msg,
        isCurrentUser: msg.sender.name === userName
      }))

      const roomId = messages?.[0]?.roomId;
      jotaiStore.set(RoomMessagesAtom, prev => ({
        ...prev,
        [roomId]: formattedMessages
      }));
    });

    socket.on('receive_message', (message: Message) => {
      console.log("receive_message", message)

      const roomId = message.roomId;
      jotaiStore.set(RoomMessagesAtom, prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), { ...message, isCurrentUser: message.sender.name === userName }]
      }));
    });
  }

  socket.on('mention_notification', (data: {
    roomId: string,
    messageId: string,
    sender: { name: string, avatar?: string },
    content: string
  }) => {
    jotaiStore.set(mentionedRoomsAtom, prev => {
      const newSet = new Set(prev);
      newSet.add(data.roomId);
      return newSet;
    });
  });

  return socket;
};

export const closeSocket = (): void => {
  if (socket) {
    socket.off('history_messages')
    socket.off('receive_message')
    socket.off('mention_notification')
    socket.off('message_notification')
    socket.off('unread_counts')
    socket.disconnect();
    socket = null;
    // 重置未读消息计数
    jotaiStore.set(unreadCountsAtom, {});
  }
};

// 房间相关功能
export const joinRoom = (roomId: string, options?: { fullHistory?: boolean, notificationsOnly?: boolean }): void => {
  if (socket) {
    socket.emit('join_room', { roomId, options });
  }
};

// 离开房间
export const leaveRoom = (roomId: string): void => {
  if (socket) {
    socket.emit('leave_room', { roomId });
  }
};

// 更改房间模式
export const changeRoomMode = (roomId: string, options: { fullHistory?: boolean, notificationsOnly?: boolean }): void => {
  if (socket) {
    socket.emit('change_room_mode', { roomId, ...options });
  }
};

// 获取所有房间的未读消息计数
export const requestUnreadCounts = (): void => {
  if (socket) {
    socket.emit('get_unread_counts');
  }
};

// 重置某个房间的未读计数
export const resetUnreadCount = (roomId: string): void => {
  if (socket) {
    socket.emit('reset_unread_count', roomId);
    // 本地也更新 Jotai 状态
    jotaiStore.set(unreadCountsAtom, prev => {
      const newCounts = { ...prev };
      newCounts[roomId] = 0;
      return newCounts;
    });
  }
};

// 消息相关功能
export const sendMessage = (data: Message & { quotedMessageId?: string, mentions?: string[] }): void => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const markMessageAsRead = (messageId: string, userName: string): void => {
  if (socket) {
    socket.emit('mark_as_read', { messageId, userName });
  }
};
