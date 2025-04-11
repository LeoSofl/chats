import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageItem from './MessageItem';

const MessageList: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col p-4 overflow-y-auto h-full">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
