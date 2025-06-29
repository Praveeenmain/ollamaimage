import { useState, useCallback } from 'react';
import { GeneratedImage, OllamaResponse, OllamaModel, SelectedModel } from '../types';
import { OLLAMA_CONFIG, getBestModelForTask, isImageGenerationModel } from '../config/ollama';

export const useOllama = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(null);

  // Check available models
  const checkAvailableModels = useCallback(async () => {
    try {
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.TAGS}`);
      if (response.ok) {
        const data = await response.json();
        const models: OllamaModel[] = data.models || [];
        setAvailableModels(models);
        return models;
      }
      return [];
    } catch (error) {
      console.error('Error checking available models:', error);
      return [];
    }
  }, []);

  const generateImages = useCallback(async (prompt: string): Promise<GeneratedImage[]> => {
    setIsLoading(true);
    
    try {
      // First check if Ollama is running
      const models = await checkAvailableModels();
      if (models.length === 0) {
        throw new Error(`Ollama is not running. Please start Ollama and ensure it's accessible at ${OLLAMA_CONFIG.BASE_URL}`);
      }

      // Use selected model if available, otherwise auto-select
      const modelToUse = selectedModel?.name || getBestModelForTask(models.map(m => m.name), 'IMAGE_GENERATION') || models[0]?.name;

      if (!modelToUse) {
        throw new Error('No suitable model found');
      }

      // Check if the selected model supports image generation
      const hasImageModel = isImageGenerationModel(modelToUse) || 
                           models.some(m => m.name === modelToUse && isImageGenerationModel(m.name));

      if (hasImageModel) {
        // Use actual image generation
        return await generateWithImageModel(prompt, modelToUse);
      } else {
        // Fallback to text model with placeholder images
        return await generateWithTextModel(prompt, modelToUse);
      }
    } catch (error) {
      console.error('Error generating images:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkAvailableModels, selectedModel]);

  const generateWithImageModel = async (prompt: string, modelName: string): Promise<GeneratedImage[]> => {
    const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false,
        options: OLLAMA_CONFIG.DEFAULT_OPTIONS,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // For now, we'll still use placeholder images since actual image generation
    // might require additional setup. In a real implementation, you'd process
    // the actual image data from the response
    const generatedImages: GeneratedImage[] = [
      {
        id: `img-${Date.now()}-1`,
        url: `https://picsum.photos/512/512?random=${Date.now()}&prompt=${encodeURIComponent(prompt)}`,
        prompt: data.response || prompt,
        timestamp: new Date(),
      },
      {
        id: `img-${Date.now()}-2`,
        url: `https://picsum.photos/512/512?random=${Date.now() + 1}&prompt=${encodeURIComponent(prompt)}`,
        prompt: data.response || prompt,
        timestamp: new Date(),
      },
    ];
    
    return generatedImages;
  };

  const generateWithTextModel = async (prompt: string, modelName: string): Promise<GeneratedImage[]> => {
    const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: `Generate a detailed description of an image based on this prompt: "${prompt}". Focus on visual details, composition, style, and artistic elements.`,
        stream: false,
        options: OLLAMA_CONFIG.DEFAULT_OPTIONS,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Create placeholder images with the generated description
    const generatedImages: GeneratedImage[] = [
      {
        id: `img-${Date.now()}-1`,
        url: `https://picsum.photos/512/512?random=${Date.now()}&prompt=${encodeURIComponent(prompt)}`,
        prompt: data.response || prompt,
        timestamp: new Date(),
      },
      {
        id: `img-${Date.now()}-2`,
        url: `https://picsum.photos/512/512?random=${Date.now() + 1}&prompt=${encodeURIComponent(prompt)}`,
        prompt: data.response || prompt,
        timestamp: new Date(),
      },
    ];
    
    return generatedImages;
  };

  // Add a function to check if Ollama is available
  const checkOllamaStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.TAGS}`);
      return response.ok;
    } catch (error) {
      console.error('Ollama not available:', error);
      return false;
    }
  }, []);

  const handleModelSelect = useCallback((model: SelectedModel) => {
    setSelectedModel(model);
  }, []);

  return {
    generateImages,
    checkOllamaStatus,
    checkAvailableModels,
    availableModels,
    selectedModel,
    handleModelSelect,
    isLoading,
  };
};