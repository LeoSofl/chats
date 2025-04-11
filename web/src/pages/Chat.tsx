import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatContainer from '../components/chat/ChatContainer';
import { ChatProvider } from '../contexts/ChatContext';

const Chat: React.FC = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <ChatContainer />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat;
