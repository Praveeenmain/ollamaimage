import React from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { GeneratedImage } from '../types';
import { downloadImage, generateFilename } from '../utils/imageUtils';

interface ImageModalProps {
  image: GeneratedImage;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (prompt: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  image,
  isOpen,
  onClose,
  onRegenerate,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const filename = generateFilename(image.prompt, 0);
    downloadImage(image.url, filename);
  };

  const handleRegenerate = () => {
    onRegenerate(image.prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 truncate mr-4">
            {image.prompt}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Generated on {image.timestamp.toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};