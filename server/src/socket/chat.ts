import { Server, Socket } from 'socket.io';
import { IMessage, Message } from '../models/Message';
import { Room } from '../models/Room';
import mongoose from 'mongoose';

// 保存用户的房间模式状态
interface SocketRoomState {
  fullHistory: boolean;
  notificationsOnly: boolean;
}

// 用户的连接状态，包含所有加入的房间和模式
interface UserConnectionState {
  userName: string;
  rooms: Map<string, SocketRoomState>;
}

// 保存所有连接的用户状态
const userConnections = new Map<string, UserConnectionState>();

export const setupChatHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    const userName = socket.handshake.auth.userName || 'Anonymous';

    // 初始化用户连接状态
    userConnections.set(socket.id, {
      userName,
      rooms: new Map()
    });

    // 获取用户未读消息计数
    const getUnreadCountsForUser = async (userName: string): Promise<Record<string, number>> => {
      const rooms = await Room.find({ 'participants.name': userName }).lean();
      const result: Record<string, number> = {};

      for (const room of rooms) {
        const roomId = room.name;
        const count = await Message.countDocuments({
          roomId,
          'sender.name': { $ne: userName },
          readBy: { $nin: [userName] }
        });

        result[roomId] = count;
      }

      return result;
    };

    // 加入房间
    socket.on('join_room', async (data: { roomId: string, options?: { fullHistory?: boolean, notificationsOnly?: boolean } }) => {
      const { roomId, options = {} } = data;
      socket.join(roomId);
      console.log(`User ${userName} joined room ${roomId} with options:`, options);
      // 保存用户房间模式状态
      const userState = userConnections.get(socket.id);

      if (userState) {
        userState.rooms.set(roomId, {
          fullHistory: options.fullHistory || false,
          notificationsOnly: options.notificationsOnly || false
        });
      }

      const existingRoom = await Room.findOne({ name: roomId });
      // 如果房间存在，检查用户是否已在参与者列表中
      if (!existingRoom || !existingRoom.participants.some(p => p.name === userName)) {
        // 更新房间参与者
        console.log('updating room participants', roomId, userName)
        await Room.updateOne(
          { name: roomId },
          {
            $addToSet: { participants: { name: userName } },
            $set: { lastActivity: new Date() }
          },
          { upsert: true }
        );
      }

      // 只有需要完整历史的用户才获取历史消息
      if (!options.notificationsOnly) {
        const messages = await Message.find({ roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();

        socket.emit('history_messages', messages.reverse());
      }

      // 发送未读消息计数
      const unreadCounts = await getUnreadCountsForUser(userName);
      socket.emit('unread_counts', unreadCounts);
    });

    // 离开房间
    socket.on('leave_room', async (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);
      console.log(`User ${userName} left room ${roomId}`);

      // 从房间参与者列表中移除用户
      await Room.updateOne(
        { name: roomId },
        { $pull: { participants: { name: userName } } }
      );

      // 更新用户房间状态
      const userState = userConnections.get(socket.id);
      if (userState && userState.rooms.has(roomId)) {
        userState.rooms.delete(roomId);
      }
    });

    // 更改房间模式
    socket.on('change_room_mode', async (data: { roomId: string, fullHistory?: boolean, notificationsOnly?: boolean }) => {
      const { roomId, fullHistory, notificationsOnly } = data;

      // 更新用户房间模式状态
      const userState = userConnections.get(socket.id);
      if (userState && userState.rooms.has(roomId)) {
        const roomState = userState.rooms.get(roomId)!;

        if (fullHistory) {
          roomState.fullHistory = fullHistory;
          roomState.notificationsOnly = false;
        }

        if (notificationsOnly) {
          roomState.notificationsOnly = notificationsOnly;
          roomState.fullHistory = false;
        }

        userState.rooms.set(roomId, roomState);
      }

      // 如果切换到完整模式，发送历史消息
      if (fullHistory) {
        const messages = await Message.find({ roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();

        socket.emit('history_messages', messages.reverse());

        // 标记该房间所有消息为已读
        await Message.updateMany(
          { roomId, readBy: { $nin: [userName] } },
          { $addToSet: { readBy: userName } }
        );

        // 发送更新后的未读消息计数
        const unreadCounts = await getUnreadCountsForUser(userName);
        socket.emit('unread_counts', unreadCounts);
      }
    });

    // 获取所有房间的未读消息计数
    socket.on('get_unread_counts', async () => {
      const unreadCounts = await getUnreadCountsForUser(userName);
      socket.emit('unread_counts', unreadCounts);
    });

    // 重置某个房间的未读计数
    socket.on('reset_unread_count', async (roomId: string) => {
      // 标记该房间所有消息为已读
      await Message.updateMany(
        { roomId, readBy: { $nin: [userName] } },
        { $addToSet: { readBy: userName } }
      );

      // 发送更新后的未读消息计数
      const unreadCounts = await getUnreadCountsForUser(userName);
      socket.emit('unread_counts', unreadCounts);
    });

    // 发送消息
    socket.on('send_message', async (data: IMessage & { quotedMessageId?: string, mentions?: string[] }) => {
      const messageData: IMessage = {
        ...data,
        timestamp: new Date(),
        readBy: [data.sender.name],
        mentions: data.mentions || []
      };

      // 如果有引用消息ID，获取引用消息详情
      if (data.quotedMessageId) {
        try {
          const quotedMsg = await Message.findById(data.quotedMessageId).lean();
          if (quotedMsg) {
            messageData.quote = {
              messageId: new mongoose.Types.ObjectId(data.quotedMessageId),
              content: quotedMsg.content,
              sender: quotedMsg.sender,
              timestamp: quotedMsg.timestamp
            };
          }
        } catch (error) {
          console.error('Error fetching quoted message:', error);
        }
      }

      // 保存消息到数据库
      const message = new Message(messageData);
      const savedMessage = await message.save();

      // 更新房间最后活动时间
      await Room.updateOne(
        { name: data.roomId },
        { $set: { lastActivity: new Date() } }
      );

      // 获取房间内所有套接字ID
      const roomSockets = await io.in(data.roomId).fetchSockets();

      // 向不同套接字发送不同类型的消息
      for (const roomSocket of roomSockets) {
        const socketId = roomSocket.id;
        const socketState = userConnections.get(socketId);

        if (socketState && socketState.rooms.has(data.roomId)) {
          const roomState = socketState.rooms.get(data.roomId)!;
          // 完整消息发送给不是通知模式的用户
          if (!roomState.notificationsOnly) {
            io.to(socketId).emit('receive_message', {
              ...savedMessage.toObject(),
            });
          }
          // 通知消息发送给通知模式的用户
          else {
            io.to(socketId).emit('message_notification', {
              roomId: data.roomId,
              messageId: savedMessage._id.toString(),
              sender: data.sender
            });
          }

          // 如果用户被@了，发送特殊通知
          if (socketState.userName && messageData.mentions?.includes(socketState.userName)) {
            io.to(socketId).emit('mention_notification', {
              roomId: data.roomId,
              messageId: savedMessage._id.toString(),
              sender: data.sender,
              content: messageData.content
            });
          }
        }
      }
    });

    // 标记消息已读
    socket.on('mark_as_read', async ({ messageId, userName }: { messageId: string, userName: string }) => {
      await Message.updateOne(
        { _id: messageId },
        { $addToSet: { readBy: userName } }
      );

      // 更新未读消息计数
      const unreadCounts = await getUnreadCountsForUser(userName);
      socket.emit('unread_counts', unreadCounts);
    });

    // 断开连接
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      // 获取用户状态
      const userState = userConnections.get(socket.id);

      if (userState) {
        const userRooms = Array.from(userState.rooms.keys());

        // 从所有加入的房间中移除该用户
        for (const roomId of userRooms) {
          await Room.updateOne(
            { name: roomId },
            { $pull: { participants: { name: userState.userName } } }
          );
          console.log(`Removed user ${userState.userName} from room ${roomId}`);
        }
      }

      // 清理用户连接状态
      userConnections.delete(socket.id);
    });
  });
}; 