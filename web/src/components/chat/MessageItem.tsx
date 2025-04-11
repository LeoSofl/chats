import React from 'react';
import { Message } from '../../types';
import { format } from 'date-fns';
import Avatar from '../common/Avatar';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isCurrentUser = message.sender.id === 'current-user-id';

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div className="mr-2">
          <Avatar name={message.sender.name} src={message.sender.avatar} />
        </div>
      )}
      <div className={`max-w-xs md:max-w-md ${isCurrentUser ? 'bg-primary text-white' : 'bg-gray-200'} rounded-lg p-3`}>
        {message.quotedMessage && (
          <div className="border-l-2 border-gray-400 pl-2 mb-2 text-sm opacity-75">
            <p>{message.quotedMessage.content}</p>
          </div>
        )}
        <p>{message.content}</p>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </div>
      </div>
      {isCurrentUser && (
        <div className="ml-2">
          <Avatar name={message.sender.name} src={message.sender.avatar} />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
