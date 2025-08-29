import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
        aria-label="Close image view"
      >
        &times;
      </button>
      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
      >
        <img 
          src={imageUrl} 
          alt="Full screen preview" 
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;
