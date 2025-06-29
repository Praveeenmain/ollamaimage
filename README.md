# Ollama Image Chat

A React application that connects to your local Ollama instance to generate images and chat about them.

## Features

- 🔗 **Local Ollama Integration** - No API keys required, runs entirely on your local machine
- 🖼️ **Image Generation** - Generate images using your local Ollama models
- 💬 **Chat Interface** - Interactive chat interface for image generation
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Real-time Status** - Shows connection status and available models
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS

## Prerequisites

Before running this application, you need to have Ollama installed and running on your system.

### Installing Ollama

1. **macOS/Linux**: 
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Windows**: Download from [https://ollama.ai/download](https://ollama.ai/download)

3. **Start Ollama**:
   ```bash
   ollama serve
   ```

### Installing Models

For image generation, you'll want to install one of these models:

```bash
# For image generation (recommended)
ollama pull sdxl

# Alternative image generation models
ollama pull stable-diffusion
ollama pull dall-e

# For text generation (fallback)
ollama pull llama2
ollama pull mistral
```

## Getting Started

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

4. **Ensure Ollama is running** on `http://localhost:11434`

## Configuration

The application is configured to connect to Ollama at `http://localhost:11434` by default. You can modify the configuration in `src/config/ollama.ts`:

```typescript
export const OLLAMA_CONFIG = {
  BASE_URL: 'http://localhost:11434', // Change this if Ollama runs on a different port
  // ... other settings
};
```

## How It Works

1. **Connection Check**: The app automatically checks if Ollama is running and accessible
2. **Model Detection**: It discovers available models on your Ollama instance
3. **Smart Model Selection**: Automatically chooses the best model for image generation
4. **Fallback Support**: If no image generation model is available, it uses text models with placeholder images

## Supported Models

### Image Generation Models
- `sdxl` - Stable Diffusion XL (recommended)
- `stable-diffusion` - Stable Diffusion
- `dall-e` - DALL-E

### Text Models (for descriptions)
- `llama2` - Llama 2
- `mistral` - Mistral
- `codellama` - Code Llama
- `llava` - LLaVA (multimodal)

## Troubleshooting

### Ollama Not Connected
- Ensure Ollama is running: `ollama serve`
- Check if Ollama is accessible at `http://localhost:11434`
- Verify no firewall is blocking the connection

### No Models Available
- Install models: `ollama pull sdxl`
- Check installed models: `ollama list`

### Image Generation Not Working
- Install an image generation model: `ollama pull sdxl`
- Check model compatibility in the configuration

### CORS Issues
If you encounter CORS errors, you may need to configure Ollama to allow cross-origin requests or use a proxy.

## Development

### Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── utils/              # Utility functions
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure Ollama is properly installed and running
3. Verify you have the required models installed
4. Check the browser console for error messages 