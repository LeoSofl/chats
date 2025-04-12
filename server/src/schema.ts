import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    name: String!
    avatar: String
  }

  type QuotedMessage {
    id: ID!
    content: String!
    senderName: String!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    roomId: String!
    timestamp: String!
    readBy: [String!]!
    mentions: [String!]
    quotedMessage: QuotedMessage
  }

  type Room {
    id: ID!
    name: String!
    participants: [User!]!
    lastActivity: String
  }

  type UnreadCount {
    count: Int!
  }

  type Query {
    rooms: [Room!]!
    room(name: String!): Room
    messages(roomId: String!, limit: Int): [Message!]!
    unreadCount(roomId: String!, userName: String!): UnreadCount!
    roomParticipants(roomId: String!): [User!]!
  }

  type Mutation {
    createRoom(name: String!): Room!
    joinRoom(roomId: String!, userName: String!): Room!
    sendMessage(roomId: String!, content: String!, senderName: String!, quotedMessageId: ID, mentions: [String!]): Message!
    markAsRead(messageId: ID!, userName: String!): Message
    leaveRoom(roomId: String!, userName: String!): Room!
  }
`; 