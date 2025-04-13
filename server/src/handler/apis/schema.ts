import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Void

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
    _id: ID!
    name: String!
    participants: [String!]!
    lastActivity: String
  }

  type Mention {
    _id: ID!
    roomId: String!
    messageId: ID!
    mentionedUser: String
    mentioningUser: String
    timestamp: String
    content: String
    isRead: Boolean
  }

  type Unread {
    _id: ID!
    userId: String!
    roomId: String!
    count: Int!
    lastReadTimestamp: String!
    firstUnreadMessageId: ID
  }

  type UserRoom {
    _id: ID!
    userId: String!
    roomId: String!
    receiveStatus: String!
    lastActivity: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    room(name: String!): Room!
    roomMessages(roomId: String!, limit: Int, offset: Int): [Message!]!
    roomParticipants(roomId: String!): [UserRoom!]!

    userUnreads(userId: String!): [Unread!]!
    userUnreadMentions(userId: String!): [Mention!]!
  }



  type Mutation {
    createRoom(name: String!): Room!
    deleteRoom(name: String!): Int!
    addRoomParticipant(roomId: String!, userId: String!, receiveStatus: String!): Void
    updateRoomParticipant(roomId: String!, userId: String!, receiveStatus: String!): Void
    deleteRoomParticipant(roomId: String!, userId: String!): Int!

    createUnread(userId: String!, roomId: String!): Unread!
    deleteUnread(userId: String!, roomId: String!): Int!

    createMention(roomId: String!, messageId: ID!, mentionedUser: String!, mentioningUser: String!, content: String!): Mention!
    deleteMention(roomId: String!, mentionedUser: String!): Int!
    setUserMentionAsRead(userId: String!, roomId: String!): Int!

    createMessage(roomId: String!, content: String!, senderName: String!, quotedMessageId: ID, mentions: [String!]): Message!
    deleteMessage(messageId: ID!): Int!
  }
`; 