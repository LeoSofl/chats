import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import Button from '../common/Button';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="输入消息..."
        />
        <Button type="submit" className="rounded-l-none">
          发送
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
