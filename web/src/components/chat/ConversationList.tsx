import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import ConversationItem from './ConversationItem';

const ConversationList: React.FC = () => {
  const { conversations, setCurrentConversation, currentConversation } = useChat();

  return (
    <div className="divide-y">
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={currentConversation?.id === conversation.id}
          onClick={() => setCurrentConversation(conversation)}
        />
      ))}
    </div>
  );
};

export default ConversationList;