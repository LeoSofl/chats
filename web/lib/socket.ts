import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

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
  }

  return socket;
};

export const closeSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// 房间相关功能
export const joinRoom = (roomId: string): void => {
  if (socket) {
    socket.emit('join_room', roomId);
  }
};

// 消息相关功能
export const sendMessage = (data: {
  roomId: string;
  content: string;
  sender: {
    name: string;
    avatar?: string;
  };
  quotedMessageId?: string;
}): void => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const markMessageAsRead = (messageId: string, userName: string): void => {
  if (socket) {
    socket.emit('mark_as_read', { messageId, userName });
  }
}; 