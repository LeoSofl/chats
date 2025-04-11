import { User, Conversation, Message } from '../types';

export const currentUser: User = {
  id: 'current-user-id',
  name: '当前用户',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
};

export const users: User[] = [
  {
    id: 'user1',
    name: '张三',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 'user2',
    name: '李四',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    id: 'user3',
    name: '王五',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    content: '你好，最近怎么样？',
    sender: users[0],
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: 'msg2',
    content: '我很好，谢谢关心！你呢？',
    sender: currentUser,
    timestamp: new Date(Date.now() - 3500000),
    read: true,
  },
  {
    id: 'msg3',
    content: '我也不错，在忙一个新项目',
    sender: users[0],
    timestamp: new Date(Date.now() - 3400000),
    read: true,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [currentUser, users[0]],
    lastMessage: mockMessages[2],
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3400000),
  },
  {
    id: 'conv2',
    participants: [currentUser, users[1]],
    lastMessage: {
      id: 'msg4',
      content: '明天会议几点开始？',
      sender: users[1],
      timestamp: new Date(Date.now() - 1800000),
      read: false,
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'conv3',
    participants: [currentUser, users[2]],
    lastMessage: {
      id: 'msg5',
      content: '文档我已经发你邮箱了',
      sender: currentUser,
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 86400000),
  },
];
