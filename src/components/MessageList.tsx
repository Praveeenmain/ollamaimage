import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { Message as MessageType } from '../types';
import { Message } from './Message';

interface MessageListProps {
  messages: MessageType[];
  onRegenerate: (prompt: string) => void;
  onImageClick: (image: any) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onRegenerate,
  onImageClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to AI Image Generator
          </h2>
          <p className="text-gray-600">
            Describe the image you'd like to create, and I'll generate it for you using advanced AI models.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onRegenerate={onRegenerate}
          onImageClick={onImageClick}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};