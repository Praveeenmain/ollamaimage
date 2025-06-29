import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message as MessageType } from '../types';
import { ImageGrid } from './ImageGrid';
import { LoadingSpinner } from './LoadingSpinner';

interface MessageProps {
  message: MessageType;
  onRegenerate: (prompt: string) => void;
  onImageClick: (image: any) => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  onRegenerate,
  onImageClick,
}) => {
  const isUser = message.type === 'user';

  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-gray-700'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-600 mb-1">
          {isUser ? 'You' : 'Assistant'}
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
          
          {message.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{message.error}</p>
            </div>
          )}
          
          {message.isGenerating && (
            <LoadingSpinner text="Generating your images..." />
          )}
          
          {message.images && message.images.length > 0 && (
            <ImageGrid
              images={message.images}
              onRegenerate={onRegenerate}
              onImageClick={onImageClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};