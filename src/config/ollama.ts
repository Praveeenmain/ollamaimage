// Ollama Configuration
export const OLLAMA_CONFIG = {
  // Base URL for Ollama API
  BASE_URL: 'http://localhost:11434',
  
  // Default models for different tasks
  MODELS: {
    IMAGE_GENERATION: ['sdxl', 'stable-diffusion', 'dall-e'],
    TEXT_TO_IMAGE: ['stable-diffusion', 'sdxl'],
    MULTIMODAL: ['llava', 'bakllava'],
    TEXT: ['llama2', 'mistral', 'codellama'],
  },
  
  // API endpoints
  ENDPOINTS: {
    TAGS: '/api/tags',
    GENERATE: '/api/generate',
    CHAT: '/api/chat',
    EMBEDDINGS: '/api/embeddings',
  },
  
  // Default generation options
  DEFAULT_OPTIONS: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
  },
  
  // Timeout settings
  TIMEOUTS: {
    REQUEST: 30000, // 30 seconds
    CONNECTION: 5000, // 5 seconds
  },
} as const;

// Helper function to get the best available model for a task
export const getBestModelForTask = (availableModels: string[], task: keyof typeof OLLAMA_CONFIG.MODELS): string | null => {
  const preferredModels = OLLAMA_CONFIG.MODELS[task];
  
  for (const model of preferredModels) {
    const found = availableModels.find(available => 
      available.toLowerCase().includes(model.toLowerCase())
    );
    if (found) return found;
  }
  
  return availableModels[0] || null;
};

// Helper function to check if a model supports image generation
export const isImageGenerationModel = (modelName: string): boolean => {
  const imageModels = [
    ...OLLAMA_CONFIG.MODELS.IMAGE_GENERATION,
    ...OLLAMA_CONFIG.MODELS.TEXT_TO_IMAGE
  ];
  
  return imageModels.some(model => 
    modelName.toLowerCase().includes(model.toLowerCase())
  );
}; 