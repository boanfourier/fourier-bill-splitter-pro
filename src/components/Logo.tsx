
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img 
        src="/lovable-uploads/0af8fa0e-21f6-4556-9fa4-13109f978c76.png" 
        alt="Fourier Project Logo" 
        className="h-12 w-12 mr-3"
      />
      <h1 className="text-2xl font-bold text-gray-800">
        Fourier Project
      </h1>
    </div>
  );
};
