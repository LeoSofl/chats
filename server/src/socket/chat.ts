import { Server, Socket } from 'socket.io';
import { IMessage } from '../models/Message';
import mongoose from 'mongoose';
import { addOrUpdateRoom } from '../service/room';
import { incrementUnreadCount } from '../service/unread';
import { addOrUpdateUserRoom, deleteUserRoom, deleteUserRooms, getRoomUsers, getUserRoom } from '../service/UserRoom';
import { addMessage, getMessage } from '../service/messages';
import { addOrUpdateMention } from '../service/metions';


export const setupChatHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    const userName = socket.handshake.auth.userName || 'Anonymous';

    // // 初始化用户连接状态
    // userConnections.set(socket.id, {
    //   userName,
    //   rooms: new Map()
    // });

    // 加入房间
    socket.on('join_room', async (data: { roomId: string, options?: { fullHistory?: boolean, notificationsOnly?: boolean } }) => {
      const { roomId, options = {} } = data;
      socket.join(roomId);
      console.log(`User ${userName} joined room ${roomId} with options:`, options);
      // 保存用户房间模式状态

      const existingUserRoom = await getUserRoom({ userId: userName, roomId });
      if (!existingUserRoom) {
        // 如果房间不存在，创建房间
        await addOrUpdateUserRoom({ userId: userName, roomId, receiveStatus: 'notice' });
      }

      // // 发送未读消息计数
      // const unreadCounts = await getUnreadCountsForUser({ userId: userName });
      // socket.emit('unread_counts', unreadCounts);

      // // 发送房间参与者
      const participants = await getRoomUsers(roomId);
      socket.emit('participants', participants);
    });

    // 离开房间
    socket.on('leave_room', async (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);
      console.log(`User ${userName} left room ${roomId}`);

      // 从房间参与者列表中移除用户
      await deleteUserRoom({ userId: userName, roomId });
    });

    // // 更改房间模式
    // socket.on('change_room_mode', async (data: { roomId: string, fullHistory?: boolean, notificationsOnly?: boolean }) => {
    //   const { roomId, fullHistory, notificationsOnly } = data;

    //   // 更新用户房间模式状态
    //   const userRoom = await getUserRoom({ userId: userName, roomId });
    //   if (userRoom) {
    //     if (fullHistory) {
    //       await addOrUpdateUserRoom({ userId: userName, roomId, receiveStatus: 'all' });
    //     } else if (notificationsOnly) {
    //       await addOrUpdateUserRoom({ userId: userName, roomId, receiveStatus: 'notice' });
    //     } else {
    //       await addOrUpdateUserRoom({ userId: userName, roomId, receiveStatus: 'none' });
    //     }
    //   }
    // });

    // // 获取所有房间的未读消息计数
    // socket.on('get_unread_counts', async () => {
    //   const unreadCounts = await getUnreadCountsForUser({ userId: userName });
    //   socket.emit('unread_counts', unreadCounts);
    // });

    // // 重置某个房间的未读计数
    // socket.on('reset_unread_count', async (roomId: string) => {
    //   // 标记该房间所有消息为已读
    //   await Message.updateMany(
    //     { roomId, readBy: { $nin: [userName] } },
    //     { $addToSet: { readBy: userName } }
    //   );

    //   // 发送更新后的未读消息计数
    //   const unreadCounts = await getUnreadCountsForUser(userName);
    //   socket.emit('unread_counts', unreadCounts);
    // });

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
          const quotedMsg = await getMessage({ messageId: data.quotedMessageId });
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
      const savedMessage = await addMessage(messageData);

      // 更新房间最后活动时间
      await addOrUpdateRoom({ name: data.roomId, lastActivity: new Date() });

      // 获取房间内所有套接字ID
      const roomSockets = await io.in(data.roomId).fetchSockets();

      // 向不同套接字发送不同类型的消息
      for (const roomSocket of roomSockets) {
        const socketId = roomSocket.id;
        const userRoom = await getUserRoom({ userId: userName, roomId: data.roomId });

        if (userRoom) {
          // 完整消息发送给不是通知模式的用户
          if (userRoom.receiveStatus === 'all') {
            io.to(socketId).emit('receive_message', {
              ...savedMessage?.toObject(),
            });
          }
          // 通知消息发送给通知模式的用户
          else if (userRoom.receiveStatus === 'notice') {
            await incrementUnreadCount({ roomId: data.roomId, messageId: savedMessage?._id.toString() ?? '', excludeUserId: userName });
            io.to(socketId).emit('message_notification', {
              roomId: data.roomId,
              messageId: savedMessage?._id.toString(),
              sender: data.sender
            });

            // 如果用户被@了，发送特殊通知
            if (userName && messageData.mentions?.includes(userName)) {
              for (const mentionedUser of messageData.mentions) {
                await addOrUpdateMention({ roomId: data.roomId, messageId: savedMessage?._id.toString() ?? '', mentionedUser: mentionedUser, mentioningUser: userName, content: messageData.content });
              }
              io.to(socketId).emit('mention_notification', {
                roomId: data.roomId,
                messageId: savedMessage?._id.toString(),
                sender: data.sender,
                content: messageData.content
              });
            }
          }
        }
      }
    });

    // // 标记消息已读
    // socket.on('mark_as_read', async ({ messageId, userName }: { messageId: string, userName: string }) => {
    //   await Message.updateOne(
    //     { _id: messageId },
    //     { $addToSet: { readBy: userName } }
    //   );

    //   // 更新未读消息计数
    //   const unreadCounts = await getUnreadCountsForUser({ userId: userName });
    //   socket.emit('unread_counts', unreadCounts);
    // });

    // 断开连接
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      await deleteUserRooms({ userId: userName });
    });
  });
}; 