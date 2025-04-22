
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-full h-12 w-12 flex items-center justify-center mr-3">
        <span className="text-white font-bold text-xl">F</span>
      </div>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
        Fourier Project
      </h1>
    </div>
  );
};
