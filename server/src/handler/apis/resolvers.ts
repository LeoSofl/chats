import { IResolvers } from '@graphql-tools/utils';
import { addMessage, deleteMessage, getRoomMessages } from '../../service/messages';
import { addOrUpdateRoom, deleteRoom, getRoom } from '../../service/room';
import { addOrUpdateUnreadCount, deleteUnreadCount, getUnreadCountsForUser } from '../../service/unread';
import { addOrUpdateMention, deleteMention, getUserUnreadMentions, setUserMentionAsRead } from '../../service/metions';
import { addOrUpdateUserRoom, deleteUserRoom, getRoomUsers } from '../../service/UserRoom';

// 定义 Resolver 上下文
interface Context {
  req: any;
}

// 定义解析器
export const resolvers: IResolvers<any, Context> = {
  Query: {
    // room: getRoom,
    roomMessages: async (_, { roomId, limit = 50, offset = 0 }) => await getRoomMessages({ roomId, limit, offset }),
    roomParticipants: async (_, { roomId }) => await getRoomUsers(roomId),

    userUnreads: async (_, { userId }) => await getUnreadCountsForUser(userId),

    userUnreadMentions: async (_, { userId }) => await getUserUnreadMentions(userId),
  },

  Mutation: {
    // createRoom: addOrUpdateRoom,
    // deleteRoom: deleteRoom,
    addRoomParticipant: async (_, { userId, roomId, receiveStatus }) => await addOrUpdateUserRoom({ userId, roomId, receiveStatus }),
    updateRoomParticipant: async (_, { userId, roomId, receiveStatus }) => await addOrUpdateUserRoom({ userId, roomId, receiveStatus }),
    deleteRoomParticipant: async (_, { userId, roomId }) => await deleteUserRoom({ userId, roomId }),

    // createUnread: addOrUpdateUnreadCount,
    deleteUnread: async (_, { userId, roomId }) => await deleteUnreadCount({ userId, roomId }),

    // createMention: addOrUpdateMention,
    // deleteMention: deleteMention,
    setUserMentionAsRead: async (_, { userId, roomId }) => await setUserMentionAsRead({ userId, roomId }),

    // createMessage: addMessage,
    // deleteMessage: deleteMessage,
  }
}; 