import React from 'react';
import { format } from 'date-fns';
import { Conversation, User } from '../../types';
import Avatar from '../common/Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  // 获取对话中的另一个用户（假设是一对一聊天）
  const otherParticipant = conversation.participants.find(
    p => p.id !== 'current-user-id'
  ) as User;

  return (
    <div
      className={`p-4 hover:bg-gray-100 cursor-pointer ${
        isActive ? 'bg-gray-100' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <Avatar name={otherParticipant.name} src={otherParticipant.avatar} />
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium">{otherParticipant.name}</h3>
            {conversation.lastMessage && (
              <span className="text-xs text-gray-500">
                {format(new Date(conversation.lastMessage.timestamp), 'HH:mm')}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 truncate max-w-[180px]">
              {conversation.lastMessage?.content || '没有消息'}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
