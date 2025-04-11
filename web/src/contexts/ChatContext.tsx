import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { Conversation, Message } from '../types';

import { mockConversations, mockMessages } from '../utils/mockData';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  setCurrentConversation: (conversation: Conversation) => void;
  sendMessage: (content: string, quotedMessageId?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 监听新消息
    socket.on('message', (message: Message) => {
        if (currentConversation) {
            // 模拟从服务器获取消息
            setMessages(mockMessages);
          }
    //   if (currentConversation && message.sender.id !== 'current-user-id') {
    //     setMessages(prev => [...prev, message]);
    //   }
      
    //   // 更新会话列表中的最后一条消息
    //   setConversations(prev => 
    //     prev.map(conv => 
    //       conv.id === message.sender.id ? { ...conv, lastMessage: message } : conv
    //     )
    //   );
    });

    return () => {
      socket.off('message');
    };
  }, [currentConversation]);

  const sendMessage = (content: string, quotedMessageId?: string) => {
    if (!currentConversation) return;
    
    const message = {
      id: Date.now().toString(),
      content,
      sender: { id: 'current-user-id', name: 'Current User' },
      timestamp: new Date(),
      read: false,
      quotedMessage: quotedMessageId ? messages.find(m => m.id === quotedMessageId) : undefined,
    };
    
    socket.emit('sendMessage', {
      conversationId: currentConversation.id,
      content,
      quotedMessageId
    });
    
    setMessages(prev => [...prev, message as Message]);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      messages,
      setCurrentConversation,
      sendMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
