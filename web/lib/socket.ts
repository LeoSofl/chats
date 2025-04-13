import { io, Socket } from 'socket.io-client';
import { getDefaultStore } from 'jotai';
import { MentionsAtom, RoomMessagesAtom, UnreadCountsAtom } from './store/chat';
import { ROOM_INFO } from '@/components/room-list';
import { Mention, Message, UnreadCounter } from './types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';



let socket: Socket | null = null;
// Jotai 默认 store
const jotaiStore = getDefaultStore();

export const getSocket = (userName: string, currentRoomId: string): Socket => {
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

    socket.on('receive_message', (message: Message) => {
      const roomId = message.roomId;
      jotaiStore.set(RoomMessagesAtom, prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), { ...message, isCurrentUser: message.sender.name === userName }]
      }));
    });

    // 加入其他房间但设置为仅通知模式
    Object.keys(ROOM_INFO).forEach(roomId => {
      if (roomId !== currentRoomId) {
        joinRoom(roomId, { notificationsOnly: true });
      }
      else {
        joinRoom(roomId, { fullHistory: true });
      }
    });
  }

  // 添加未读消息通知处理
  socket.on('message_notification', (notification: UnreadCounter[]) => {
    jotaiStore.set(UnreadCountsAtom, notification);
  });

  socket.on('mention_notification', (data: Mention[]) => {
    jotaiStore.set(MentionsAtom, data);
  });

  return socket;
};

export const closeSocket = (): void => {
  if (socket) {
    socket.off('receive_message')
    socket.off('message_notification')
    socket.off('mention_notification')
    socket.disconnect();
    socket = null;
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


// 消息相关功能
export const sendMessage = (data: Message & { quotedMessageId?: string, mentions?: string[] }): void => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const resetUserUnread = (roomId: string, userId: string): void => {
  if (socket) {
    socket.emit('reset_user_unread', { roomId, userId });
  }
};

export const setUserMentionAsRead = (roomId: string, userId: string): void => {
  if (socket) {
    socket.emit('set_user_mention_as_read', { roomId, userId });
  }
};
