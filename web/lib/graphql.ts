import { gql } from '@apollo/client';

// 查询房间参与者
export const GET_ROOM_PARTICIPANTS = gql`
  query GetRoomParticipants($roomId: String!) {
    roomParticipants(roomId: $roomId) {
      _id
      userId
      roomId
      receiveStatus
      lastActivity
      createdAt
      updatedAt
    }
  }
`;

// 查询房间消息
export const GET_ROOM_MESSAGES = gql`
  query GetRoomMessages($roomId: String!, $limit: Int, $offset: Int) {
    roomMessages(roomId: $roomId, limit: $limit, offset: $offset) {
      _id  
      content
      sender {
        name
        avatar
      }
      timestamp
      mentions
      quote {
        messageId
        content
        sender {
          name
          avatar
        }
        timestamp
      }
    }
  }
`;

export const UPDATE_ROOM_PARTICIPANT = gql`
  mutation UpdateRoomParticipant($userId: String!, $roomId: String!, $receiveStatus: String!) {
    updateRoomParticipant(userId: $userId, roomId: $roomId, receiveStatus: $receiveStatus)
  }
`;

export const SET_USER_MENTION_AS_READ = gql`
  mutation SetUserMentionAsRead($userId: String!, $roomId: String!) {
    setUserMentionAsRead(userId: $userId, roomId: $roomId)
  }
`;

export const DELETE_UNREAD = gql`
  mutation deleteUnread($userId: String!, $roomId: String!) {
    deleteUnread(userId: $userId, roomId: $roomId)
  }
`;



