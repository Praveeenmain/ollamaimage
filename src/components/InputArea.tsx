import React, { useState, useRef, useEffect } from 'react';
import { Send, Image } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`flex items-end gap-3 rounded-xl p-3 ${disabled ? 'bg-gray-50' : 'bg-gray-100'}`}>
            <div className="flex-shrink-0">
              <Image className={`w-5 h-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
            </div>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Ollama is not connected. Please start Ollama first." : "Describe the image you want to generate..."}
              className="flex-1 bg-transparent border-none outline-none resize-none min-h-[24px] max-h-[120px] placeholder-gray-500 disabled:placeholder-gray-300"
              rows={1}
              disabled={isLoading || disabled}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading || disabled}
              className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div>
              {disabled ? 'Connect to Ollama to start generating images' : 'Press Enter to send, Shift+Enter for new line'}
            </div>
            <div>
              {input.length}/500
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};