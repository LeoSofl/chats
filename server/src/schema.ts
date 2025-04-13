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
    _id: ID!
    name: String!
    participants: [String!]!
    lastActivity: String
  }

  type Mention {
    _id: ID!
    roomId: String!
    messageId: ID!  
    mentionedUser: String;             
    mentioningUser: String;             
    timestamp: Date;                   
    content: String;                    
    isRead: boolean;                    
  }

  type Unread {
    _id: ID!
    userId: String!
    roomId: String!
    count: Int!
    lastReadTimestamp: String!
    firstUnreadMessageId: ID
  }

  type Query {
    room(name: String!): Room!
    roomMessages(roomId: String!, limit: Int, offset: Int): [Message!]!
    roomParticipants(roomId: String!): [String!]!

    userUnreads(userId: String!): [Unread!]!
    userUnreadMentions(userId: String!): [Mention!]!
  }

  type Mutation {
    createRoom(name: String!): Room!
    deleteRoom(name: String!): Int!
    addRoomParticipant(roomId: String!, participantName: String!): Room!
    deleteRoomParticipant(roomId: String!, participantName: String!): Room!

    createUnread(userId: String!, roomId: String!): UnreadCount!
    deleteUnread(userId: String!, roomId: String!): Int!

    createMention(roomId: String!, messageId: ID!, mentionedUser: String!, mentioningUser: String!, content: String!): Mention!
    deleteMention(roomId: String!, mentionedUser: String!): Int!
    setUserMentionAsRead(userId: String!, roomId: String!): Int!

    createMessage(roomId: String!, content: String!, senderName: String!, quotedMessageId: ID, mentions: [String!]): Message!
    deleteMessage(messageId: ID!): Int!
  }
`; 