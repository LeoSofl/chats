import { Server, Socket } from 'socket.io';
import { IMessage } from '../models/Message';
import mongoose from 'mongoose';
import { addOrUpdateRoom } from '../service/room';
import { incrementUnreadCount, getUnreadCountsForUser, addOrUpdateUnreadCount, deleteUnreadCount } from '../service/unread';
import { addOrUpdateUserRoom, deleteUserRoom, deleteUserRooms, getRoomUsers, getUserRoom } from '../service/UserRoom';
import { addMessage, getMessage } from '../service/messages';
import { addOrUpdateMention, getUserUnreadMentions, setUserMentionAsRead } from '../service/metions';


export const setupChatHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    const userName = socket.handshake.auth.userName || 'Anonymous';


    // 加入房间
    socket.on('join_room', async (data: { roomId: string, options?: { fullHistory?: boolean, notificationsOnly?: boolean } }) => {
      const { roomId, options = {} } = data;
      socket.join(roomId);
      // console.log(`User ${userName} joined room ${roomId} with options:`, options);
      // 保存用户房间模式状态

      const existingUserRoom = await getUserRoom({ userId: userName, roomId });
      if (!existingUserRoom) {
        // 如果房间不存在，创建房间
        await addOrUpdateUserRoom({ userId: userName, roomId, receiveStatus: options.fullHistory ? 'all' : 'notice', socketId: socket.id });
      }
      // 发送房间未读@消息计数
      const unreadMentions = await getUserUnreadMentions({ userId: userName });
      socket.emit('mention_notification', unreadMentions);

      // 发送房间未读消息计数
      const unreadCounts = await getUnreadCountsForUser({ userId: userName });
      socket.emit('message_notification', unreadCounts);


    });

    // 离开房间
    socket.on('leave_room', async (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);
      console.log(`User ${userName} left room ${roomId}`);

      // 从房间参与者列表中移除用户
      await deleteUserRoom({ userId: userName, roomId });
    });


    // 发送消息
    socket.on('send_message', async (data: IMessage & { quotedMessageId?: string }) => {
      const messageData: IMessage = {
        ...data,
        timestamp: new Date(),
        readBy: [data.sender.name],
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
        const userSocketId = roomSocket.id;
        const roomUsers = await getRoomUsers(data.roomId);
        if (roomUsers) {
          const currentUserRoom = roomUsers.find(user => user.socketId === userSocketId);
          const curReceiveStatus = currentUserRoom?.receiveStatus;
          const curUserId = currentUserRoom?.userId;
          // 完整消息发送给不是通知模式的用户
          if (curReceiveStatus === 'all') {
            io.to(userSocketId).emit('receive_message', {
              ...savedMessage?.toObject(),
            });
          }
          // 通知消息发送给通知模式的用户
          else if (curReceiveStatus === 'notice') {
            await incrementUnreadCount({ roomId: data.roomId, messageId: savedMessage?._id.toString() ?? '', excludeUserId: userName });
            const unreadCount = await getUnreadCountsForUser({ userId: curUserId ?? '' });
            io.to(userSocketId).emit('message_notification', unreadCount);

            // 如果用户被@了，发送特殊通知
            if (messageData.mentions?.includes(curUserId ?? '')) {
              for (const mentionedUser of messageData.mentions) {
                await addOrUpdateMention({ roomId: data.roomId, messageId: savedMessage?._id.toString() ?? '', mentionedUser: mentionedUser, mentioningUser: userName, content: messageData.content, isRead: false });
              }
              const unreadMentions = await getUserUnreadMentions({ userId: curUserId ?? '' });
              io.to(userSocketId).emit('mention_notification', unreadMentions);
            }
          }
        }
      }
    });

    // // 标记消息已读
    socket.on('reset_user_unread', async ({ roomId, userId }: { roomId: string, userId: string }) => {
      await deleteUnreadCount({ userId, roomId });

      const unreadCounts = await getUnreadCountsForUser({ userId: userId });
      socket.emit('message_notification', unreadCounts);
    });

    socket.on('set_user_mention_as_read', async ({ roomId, userId }: { roomId: string, userId: string }) => {
      await setUserMentionAsRead({ userId, roomId });

      const unreadMentions = await getUserUnreadMentions({ userId: userId });
      socket.emit('mention_notification', unreadMentions);
    });


    // 断开连接
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      await deleteUserRooms({ userId: userName });
    });
  });
}; 