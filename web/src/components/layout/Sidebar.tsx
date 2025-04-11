import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import ConversationList from '../chat/ConversationList';
import Avatar from '../common/Avatar';
import { currentUser } from '../../utils/mockData';

const Sidebar: React.FC = () => {
  return (
    <div className="w-80 border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Avatar name={currentUser.name} src={currentUser.avatar} size="md" />
          <h1 className="ml-3 font-medium">{currentUser.name}</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </div>
  );
};

export default Sidebar;