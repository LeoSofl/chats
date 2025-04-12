import { gql } from '@apollo/client';

// 查询相关房间
export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      participants {
        name
        avatar
      }
      lastActivity
    }
  }
`;

// 查询特定房间
export const GET_ROOM = gql`
  query GetRoom($name: String!) {
    room(name: $name) {
      id
      name
      participants {
        name
        avatar
      }
      lastActivity
    }
  }
`;

// 查询消息
export const GET_MESSAGES = gql`
  query GetMessages($roomId: String!, $limit: Int) {
    messages(roomId: $roomId, limit: $limit) {
      id
      content
      sender {
        name
        avatar
      }
      roomId
      timestamp
      readBy
      quotedMessage {
        id
        content
        senderName
      }
    }
  }
`;

// 查询未读消息数
export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($roomId: String!, $userName: String!) {
    unreadCount(roomId: $roomId, userName: $userName) {
      count
    }
  }
`;

// 创建房间
export const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!) {
    createRoom(name: $name) {
      id
      name
    }
  }
`;

// 加入房间
export const JOIN_ROOM = gql`
  mutation JoinRoom($roomId: String!, $userName: String!) {
    joinRoom(roomId: $roomId, userName: $userName) {
      id
      name
      participants {
        name
        avatar
      }
    }
  }
`;

// 离开房间
export const LEAVE_ROOM = gql`
  mutation LeaveRoom($roomId: String!, $userName: String!) {
    leaveRoom(roomId: $roomId, userName: $userName) {
      id
      name
      participants {
        name
        avatar
      }
    }
  }
`;


// 标记消息已读
export const MARK_AS_READ = gql`
  mutation MarkAsRead($messageId: ID!, $userName: String!) {
    markAsRead(messageId: $messageId, userName: $userName) {
      id
      readBy
    }
  }
`;

// 查询房间参与者
export const GET_ROOM_PARTICIPANTS = gql`
  query GetRoomParticipants($roomId: String!) {
    roomParticipants(roomId: $roomId) {
      name
      avatar
    }
  }
`; 