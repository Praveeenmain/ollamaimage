import React, { useState } from 'react';
import { ChevronDown, Brain, Code, Image, MessageSquare, Sparkles } from 'lucide-react';
import { OllamaModel, ModelCategory, SelectedModel } from '../types';

interface ModelSelectorProps {
  availableModels: OllamaModel[];
  selectedModel: SelectedModel | null;
  onModelSelect: (model: SelectedModel) => void;
  disabled?: boolean;
}

const MODEL_CATEGORIES: ModelCategory[] = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'General text and conversation',
    icon: 'MessageSquare',
    keywords: ['llama', 'mistral', 'deepseek', 'qwen', 'gemma', 'phi']
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Programming and coding assistance',
    icon: 'Code',
    keywords: ['code', 'coder', 'programming', 'developer']
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    description: 'Create images from text prompts',
    icon: 'Image',
    keywords: ['sdxl', 'stable-diffusion', 'dall-e', 'image', 'diffusion']
  },
  {
    id: 'multimodal',
    name: 'Multimodal',
    description: 'Text and image understanding',
    icon: 'Brain',
    keywords: ['llava', 'bakllava', 'multimodal', 'vision']
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    description: 'Creative content and storytelling',
    icon: 'Sparkles',
    keywords: ['creative', 'story', 'writing', 'artistic']
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'MessageSquare': return MessageSquare;
    case 'Code': return Code;
    case 'Image': return Image;
    case 'Brain': return Brain;
    case 'Sparkles': return Sparkles;
    default: return MessageSquare;
  }
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  availableModels,
  selectedModel,
  onModelSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const categorizeModels = () => {
    const categorized: { [key: string]: OllamaModel[] } = {};
    
    MODEL_CATEGORIES.forEach(category => {
      categorized[category.id] = availableModels.filter(model => 
        category.keywords.some(keyword => 
          model.name.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });

    // Add uncategorized models
    const categorizedModels = Object.values(categorized).flat();
    const uncategorized = availableModels.filter(model => 
      !categorizedModels.includes(model)
    );
    
    if (uncategorized.length > 0) {
      categorized['other'] = uncategorized;
    }

    return categorized;
  };

  const categorizedModels = categorizeModels();

  const handleModelSelect = (model: OllamaModel, category: ModelCategory) => {
    const selected: SelectedModel = {
      name: model.name,
      category: category.id,
      purpose: category.name
    };
    onModelSelect(selected);
    setIsOpen(false);
  };

  const getDisplayName = (modelName: string) => {
    // Extract a cleaner name from the model
    const cleanName = modelName
      .replace(':latest', '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    return cleanName || modelName;
  };

  const getModelSize = (size: number) => {
    if (size >= 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(size / 1024).toFixed(1)} KB`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2">
          {selectedModel ? (
            <>
              {(() => {
                const category = MODEL_CATEGORIES.find(c => c.id === selectedModel.category);
                const IconComponent = category ? getIconComponent(category.icon) : MessageSquare;
                return <IconComponent className="w-4 h-4 text-gray-500" />;
              })()}
              <span className="font-medium">{getDisplayName(selectedModel.name)}</span>
              <span className="text-xs text-gray-500">({selectedModel.purpose})</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Select a model...</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {MODEL_CATEGORIES.map(category => {
            const models = categorizedModels[category.id];
            if (!models || models.length === 0) return null;

            const IconComponent = getIconComponent(category.icon);
            
            return (
              <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </div>
                {models.map(model => (
                  <button
                    key={model.name}
                    onClick={() => handleModelSelect(model, category)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getDisplayName(model.name)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {model.details?.parameter_size} • {model.details?.quantization_level}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {getModelSize(model.size)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
          
          {categorizedModels['other'] && categorizedModels['other'].length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Other Models</span>
                </div>
              </div>
              {categorizedModels['other'].map(model => (
                <button
                  key={model.name}
                  onClick={() => handleModelSelect(model, MODEL_CATEGORIES[0])}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayName(model.name)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {model.details?.parameter_size} • {model.details?.quantization_level}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {getModelSize(model.size)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 