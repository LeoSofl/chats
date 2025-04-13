import { IResolvers } from '@graphql-tools/utils';
import { addMessage, deleteMessage, getRoomMessages } from './service/messages';
import { addRoom, addRoomParticipant, deleteRoom, deleteRoomParticipant, getRoom, getRoomParticipants } from './service/room';
import { addOrUpdateUnreadCount, deleteUnreadCount, getUnreadCountsForUser } from './service/unread';
import { addOrUpdateMention, deleteMention, getUserUnreadMentions, setUserMentionAsRead } from './service/metions';

// 定义 Resolver 上下文
interface Context {
  req: any;
}

// 定义解析器
export const resolvers: IResolvers<any, Context> = {
  Query: {
    room: getRoom,
    roomMessages: getRoomMessages,
    roomParticipants: getRoomParticipants,

    userUnreads: getUnreadCountsForUser,

    userUnreadMentions: getUserUnreadMentions,
  },

  Mutation: {
    createRoom: addRoom,
    deleteRoom: deleteRoom,
    addRoomParticipant: addRoomParticipant,
    deleteRoomParticipant: deleteRoomParticipant,

    createUnread: addOrUpdateUnreadCount,
    deleteUnread: deleteUnreadCount,

    createMention: addOrUpdateMention,
    deleteMention: deleteMention,
    setUserMentionAsRead: setUserMentionAsRead,

    createMessage: addMessage,
    deleteMessage: deleteMessage,
  }
}; 