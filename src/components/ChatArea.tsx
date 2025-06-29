import React, { useState, useEffect } from 'react';
import { Message as MessageType, GeneratedImage } from '../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ImageModal } from './ImageModal';
import { ModelSelector } from './ModelSelector';
import { useOllama } from '../hooks/useOllama';

export const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { 
    generateImages, 
    checkOllamaStatus, 
    checkAvailableModels, 
    availableModels, 
    selectedModel,
    handleModelSelect,
    isLoading 
  } = useOllama();

  // Check Ollama status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      const isConnected = await checkOllamaStatus();
      setOllamaStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected) {
        await checkAvailableModels();
      }
    };
    
    checkStatus();
  }, [checkOllamaStatus, checkAvailableModels]);

  const handleSendMessage = async (content: string) => {
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMessage: MessageType = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: `Generating images for: "${content}"`,
      timestamp: new Date(),
      isGenerating: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    try {
      const images = await generateImages(content);
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: `Here are the images I generated for "${content}":`,
              images,
              isGenerating: false,
            }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: `I encountered an error while generating images for "${content}".`,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              isGenerating: false,
            }
          : msg
      ));
    }
  };

  const handleRegenerate = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const getStatusColor = () => {
    switch (ollamaStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (ollamaStatus) {
      case 'connected': return 'Connected to Ollama';
      case 'disconnected': return 'Ollama not running';
      default: return 'Checking Ollama...';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Ollama Status Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'connected' ? 'bg-green-500' : ollamaStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          {ollamaStatus === 'connected' && availableModels.length > 0 && (
            <div className="text-xs text-gray-500">
              {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
        {ollamaStatus === 'disconnected' && (
          <div className="text-xs text-red-600 mt-1">
            Please start Ollama and ensure it's running on http://localhost:11434
          </div>
        )}
      </div>

      {/* Model Selector */}
      {ollamaStatus === 'connected' && availableModels.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Select Model:
              </label>
              <div className="flex-1 max-w-xs">
                <ModelSelector
                  availableModels={availableModels}
                  selectedModel={selectedModel}
                  onModelSelect={handleModelSelect}
                  disabled={isLoading}
                />
              </div>
              {selectedModel && (
                <div className="text-xs text-gray-500">
                  Using: {selectedModel.name.replace(':latest', '')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MessageList
        messages={messages}
        onRegenerate={handleRegenerate}
        onImageClick={handleImageClick}
      />
      
      <InputArea
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={ollamaStatus !== 'connected'}
      />

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={closeModal}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
};