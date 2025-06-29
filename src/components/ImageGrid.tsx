import React from 'react';
import { Download, RefreshCw, Maximize2 } from 'lucide-react';
import { GeneratedImage } from '../types';
import { downloadImage, generateFilename } from '../utils/imageUtils';

interface ImageGridProps {
  images: GeneratedImage[];
  onRegenerate: (prompt: string) => void;
  onImageClick: (image: GeneratedImage) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onRegenerate,
  onImageClick,
}) => {
  const handleDownload = (image: GeneratedImage, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = generateFilename(image.prompt, index);
    downloadImage(image.url, filename);
  };

  const handleRegenerate = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRegenerate(prompt);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
          onClick={() => onImageClick(image)}
        >
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-64 object-cover"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <button
                onClick={(e) => handleDownload(image, index, e)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onImageClick(image)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="View full size"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleRegenerate(image.prompt, e)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};