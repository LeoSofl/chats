import { Server, Socket } from 'socket.io';
import { Message } from '../models/Message';
import { Room } from '../models/Room';

interface MessageData {
  roomId: string;
  content: string;
  sender: {
    name: string;
    avatar?: string;
  };
}

export const setupChatHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);
    
    const userName = socket.handshake.auth.userName || 'Anonymous';
    
    // 加入房间
    socket.on('join_room', async (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${userName} joined room ${roomId}`);
      
      // 更新房间参与者
      await Room.updateOne(
        { name: roomId },
        { 
          $addToSet: { participants: { name: userName } },
          $set: { lastActivity: new Date() }
        },
        { upsert: true }
      );
      
      // 获取历史消息并发送给用户
      const messages = await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      
      socket.emit('history_messages', messages.reverse());
    });
    
    // 发送消息
    socket.on('send_message', async (data: MessageData) => {
      const messageData = {
        ...data,
        timestamp: new Date(),
        readBy: [data.sender.name]
      };
      
      // 保存消息到数据库
      const message = new Message(messageData);
      const savedMessage = await message.save();
      
      // 更新房间最后活动时间
      await Room.updateOne(
        { name: data.roomId },
        { $set: { lastActivity: new Date() } }
      );
      
      // 广播消息给房间内所有用户
      io.to(data.roomId).emit('receive_message', {
        ...savedMessage.toObject(),
        id: savedMessage._id.toString()
      });
    });
    
    // 标记消息已读
    socket.on('mark_as_read', async ({ messageId, userName }: { messageId: string, userName: string }) => {
      await Message.updateOne(
        { _id: messageId },
        { $addToSet: { readBy: userName } }
      );
    });
    
    // 断开连接
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}; 