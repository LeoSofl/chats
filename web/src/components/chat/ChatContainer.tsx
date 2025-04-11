import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Header from '../layout/Header';

const ChatContainer: React.FC = () => {
  const { currentConversation } = useChat();

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">选择一个对话开始聊天</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={currentConversation.participants
          .filter(p => p.id !== 'current-user-id')
          .map(p => p.name)
          .join(', ')} 
      />
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
