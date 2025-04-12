import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;
// 跟踪房间未读消息计数
export let roomUnreadCounts: Record<string, number> = {};

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
      roomUnreadCounts[notification.roomId] = (roomUnreadCounts[notification.roomId] || 0) + 1;
    });
    
    // 接收所有房间的未读消息计数
    socket.on('unread_counts', (counts: Record<string, number>) => {
      roomUnreadCounts = counts;
    });
  }

  return socket;
};

export const closeSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    roomUnreadCounts = {};
  }
};

// 房间相关功能
export const joinRoom = (roomId: string, options?: { fullHistory?: boolean, notificationsOnly?: boolean }): void => {
  if (socket) {
    socket.emit('join_room', { roomId, options });
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
    // 本地也更新
    roomUnreadCounts[roomId] = 0;
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