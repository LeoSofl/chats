import { Message, IMessage } from './models/Message';
import { Room, IRoom } from './models/Room';
import mongoose from 'mongoose';
import { IResolvers } from '@graphql-tools/utils';

// 定义 Resolver 上下文
interface Context {
  req: any;
}

// 定义查询参数类型
interface RoomArgs {
  name: string;
}

interface MessagesArgs {
  roomId: string;
  limit?: number;
  offset?: number;
}

interface UnreadCountArgs {
  roomId: string;
  userName: string;
}

interface RoomParticipantsArgs {
  roomId: string;
}

// 定义变更参数类型
interface CreateRoomArgs {
  name: string;
}

interface JoinRoomArgs {
  roomId: string;
  userName: string;
}

interface LeaveRoomArgs {
  roomId: string;
  userName: string;
}

interface SendMessageArgs {
  roomId: string;
  content: string;
  senderName: string;
  quotedMessageId?: string;
  mentions?: string[];
}

interface MarkAsReadArgs {
  messageId: string;
  userName: string;
}

// 定义解析器
export const resolvers: IResolvers<any, Context> = {
  Query: {
    rooms: async () => {
      const rooms = await Room.find().sort({ lastActivity: -1 });
      return rooms.map(room => ({
        ...room.toObject(),
        id: room._id.toString()
      }));
    },

    room: async (_, { name }: RoomArgs) => {
      const room = await Room.findOne({ name });
      if (!room) return null;

      return {
        ...room.toObject(),
        id: room._id.toString()
      };
    },

    roomMessages: async (_, { roomId, limit = 50, offset = 0 }: MessagesArgs): Promise<IMessage[]> => {
      console.log('offset', offset);
      const messages = await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      return messages.reverse()
    },

    unreadCount: async (_, { roomId, userName }: UnreadCountArgs) => {
      const count = await Message.countDocuments({
        roomId,
        'readBy': { $ne: userName }
      });

      return { count };
    },

    roomParticipants: async (_, { roomId }: RoomParticipantsArgs) => {
      const room = await Room.findOne({ name: roomId });
      if (!room) return [];

      // 确保返回的参与者不会有重复
      const uniqueParticipantsMap = new Map();
      if (room.participants && room.participants.length > 0) {
        room.participants.forEach(p => {
          if (p.name) {
            uniqueParticipantsMap.set(p.name, p);
          }
        });
      }

      // 转换回数组
      return Array.from(uniqueParticipantsMap.values());
    }
  },

  Mutation: {
    createRoom: async (_, { name }: CreateRoomArgs) => {
      const existingRoom = await Room.findOne({ name });
      if (existingRoom) {
        return {
          ...existingRoom.toObject(),
          id: existingRoom._id.toString()
        };
      }

      const room = new Room({ name });
      await room.save();

      return {
        ...room.toObject(),
        id: room._id.toString()
      };
    },

    joinRoom: async (_, { roomId, userName }: JoinRoomArgs) => {
      // 首先查询房间，检查用户是否已经存在
      const existingRoom = await Room.findOne({ name: roomId });

      // 如果房间存在，检查用户是否已在参与者列表中
      if (existingRoom && existingRoom.participants.some(p => p.name === userName)) {
        // 用户已存在，直接返回现有房间
        return {
          ...existingRoom.toObject(),
          id: existingRoom._id.toString()
        };
      }

      // 用户不存在或房间不存在，添加用户
      const room = await Room.findOneAndUpdate(
        { name: roomId },
        {
          $addToSet: { participants: { name: userName } },
          $set: { lastActivity: new Date() }
        },
        { new: true, upsert: true }
      );

      return {
        ...room.toObject(),
        id: room._id.toString()
      };
    },

    leaveRoom: async (_, { roomId, userName }: LeaveRoomArgs) => {
      const room = await Room.findOneAndUpdate(
        { name: roomId },
        { $pull: { participants: { name: userName } } }
      );

      if (!room) return null;

      return {
        ...room.toObject(),
        id: room._id.toString()
      };
    },

    sendMessage: async (_, { roomId, content, senderName, quotedMessageId, mentions }: SendMessageArgs) => {
      // 获取引用消息
      let quotedMessage = undefined;
      if (quotedMessageId) {
        const quotedMsg = await Message.findById(quotedMessageId);
        if (quotedMsg) {
          quotedMessage = {
            id: quotedMsg._id.toString(),
            content: quotedMsg.content,
            senderName: quotedMsg.sender.name
          };
        }
      }

      // 创建新消息
      const message = new Message({
        content,
        sender: { name: senderName },
        roomId,
        timestamp: new Date(),
        readBy: [senderName],
        mentions: mentions || [],
        quotedMessage
      });

      await message.save();

      // 更新房间最后活动时间
      await Room.updateOne(
        { name: roomId },
        { $set: { lastActivity: new Date() } }
      );

      return {
        ...message.toObject(),
        id: message._id.toString(),
        timestamp: message.timestamp.toISOString()
      };
    },

    markAsRead: async (_, { messageId, userName }: MarkAsReadArgs) => {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userName } },
        { new: true }
      );

      if (!message) return null;

      return {
        ...message.toObject(),
        id: message._id.toString(),
        timestamp: message.timestamp.toISOString()
      };
    }
  }
}; 