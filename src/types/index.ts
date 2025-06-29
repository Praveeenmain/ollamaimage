export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: GeneratedImage[];
  isGenerating?: boolean;
  error?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface OllamaResponse {
  images?: string[];
  error?: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model: string;
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ModelCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
}

export interface SelectedModel {
  name: string;
  category: string;
  purpose: string;
}