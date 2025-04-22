
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-6 text-gray-500 text-sm">
      <p>© {new Date().getFullYear()} Fourier Project | Bill Splitter Pro</p>
      <p className="mt-1">Made with ♥ by Fourier Project team</p>
    </footer>
  );
};
