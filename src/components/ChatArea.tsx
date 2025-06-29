import React, { useState, useEffect } from 'react';
import { Message as MessageType, GeneratedImage } from '../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ImageModal } from './ImageModal';
import { ModelSelector } from './ModelSelector';
import { useOllama } from '../hooks/useOllama';
import { chatService } from '../services/chatService';

export const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { 
    generateImages, 
    checkOllamaStatus, 
    checkAvailableModels, 
    availableModels, 
    selectedModel,
    handleModelSelect,
    isLoading 
  } = useOllama();

  // Check backend and Ollama status on component mount
  useEffect(() => {
    const checkStatuses = async () => {
      // Check backend status
      const isBackendConnected = await chatService.checkHealth();
      setBackendStatus(isBackendConnected ? 'connected' : 'disconnected');
      
      // Check Ollama status
      const isOllamaConnected = await checkOllamaStatus();
      setOllamaStatus(isOllamaConnected ? 'connected' : 'disconnected');
      
      if (isOllamaConnected) {
        await checkAvailableModels();
      }

      // Load chat history if backend is connected
      if (isBackendConnected) {
        try {
          const history = await chatService.getMessages();
          setMessages(history);
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      }
      
      setIsLoadingHistory(false);
    };
    
    checkStatuses();
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

    // Update local state immediately for better UX
    setMessages(prev => [...prev, userMessage, assistantMessage]);

    // Save user message to backend
    if (backendStatus === 'connected') {
      try {
        await chatService.saveMessage(userMessage);
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }

    // Save initial assistant message to backend
    if (backendStatus === 'connected') {
      try {
        await chatService.saveMessage(assistantMessage);
      } catch (error) {
        console.error('Failed to save assistant message:', error);
      }
    }

    try {
      const images = await generateImages(content);
      
      const updatedAssistantMessage = {
        ...assistantMessage,
        content: `Here are the images I generated for "${content}":`,
        images,
        isGenerating: false,
      };

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id ? updatedAssistantMessage : msg
      ));

      // Update message in backend
      if (backendStatus === 'connected') {
        try {
          await chatService.updateMessage(assistantMessage.id, {
            content: updatedAssistantMessage.content,
            images: updatedAssistantMessage.images,
            isGenerating: false,
          });
        } catch (error) {
          console.error('Failed to update assistant message:', error);
        }
      }
    } catch (error) {
      const errorMessage = {
        ...assistantMessage,
        content: `I encountered an error while generating images for "${content}".`,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isGenerating: false,
      };

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id ? errorMessage : msg
      ));

      // Update message in backend
      if (backendStatus === 'connected') {
        try {
          await chatService.updateMessage(assistantMessage.id, {
            content: errorMessage.content,
            error: errorMessage.error,
            isGenerating: false,
          });
        } catch (error) {
          console.error('Failed to update assistant message with error:', error);
        }
      }
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

  const handleClearHistory = async () => {
    if (backendStatus === 'connected') {
      try {
        await chatService.clearMessages();
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear chat history:', error);
      }
    } else {
      setMessages([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = (service: string, status: string) => {
    switch (status) {
      case 'connected': return `${service} Connected`;
      case 'disconnected': return `${service} Disconnected`;
      default: return `Checking ${service}...`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Status Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Ollama Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'connected' ? 'bg-green-500' : ollamaStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(ollamaStatus)}`}>
                {getStatusText('Ollama', ollamaStatus)}
              </span>
            </div>
            
            {/* Backend Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' : backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(backendStatus)}`}>
                {getStatusText('Backend', backendStatus)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {ollamaStatus === 'connected' && availableModels.length > 0 && (
              <div className="text-xs text-gray-500">
                {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
              </div>
            )}
            
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear History
              </button>
            )}
          </div>
        </div>
        
        {ollamaStatus === 'disconnected' && (
          <div className="text-xs text-red-600 mt-1">
            Please start Ollama and ensure it's running on http://localhost:11434
          </div>
        )}
        
        {backendStatus === 'disconnected' && (
          <div className="text-xs text-red-600 mt-1">
            Backend server is not running. Chat history will not be saved.
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

      {isLoadingHistory ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading chat history...</p>
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          onRegenerate={handleRegenerate}
          onImageClick={handleImageClick}
        />
      )}
      
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