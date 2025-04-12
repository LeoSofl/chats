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
}

interface UnreadCountArgs {
  roomId: string;
  userName: string;
}

// 定义变更参数类型
interface CreateRoomArgs {
  name: string;
}

interface JoinRoomArgs {
  roomId: string;
  userName: string;
}

interface SendMessageArgs {
  roomId: string;
  content: string;
  senderName: string;
  quotedMessageId?: string;
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

    messages: async (_, { roomId, limit = 50 }: MessagesArgs) => {
      const messages = await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return messages.reverse().map(msg => ({
        ...msg,
        id: msg._id.toString(),
        timestamp: msg.timestamp.toISOString()
      }));
    },

    unreadCount: async (_, { roomId, userName }: UnreadCountArgs) => {
      const count = await Message.countDocuments({
        roomId,
        'readBy': { $ne: userName }
      });

      return { count };
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

    sendMessage: async (_, { roomId, content, senderName, quotedMessageId }: SendMessageArgs) => {
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