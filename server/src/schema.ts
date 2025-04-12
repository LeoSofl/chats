import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    name: String!
    avatar: String
  }

  type Quote {
    messageId: ID!
    content: String!
    sender: User!
    timestamp: String!
  }

  type Message {
    _id: ID!
    content: String!
    sender: User!
    roomId: String!
    timestamp: String!
    readBy: [String!]!
    mentions: [String!]
    quote: Quote
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
    roomMessages(roomId: String!, limit: Int, offset: Int): [Message!]!
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