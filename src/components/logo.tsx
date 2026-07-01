import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      width={size}
      height={size}
    >
      {/* Geometric Leaf Outline */}
      <path 
        d="M12 2C12 2 19 8 19 13C19 16.87 15.87 20 12 20C8.13 20 5 16.87 5 13C5 8 12 2 12 2Z" 
        fill="currentColor" 
      />
      {/* Enterprise Building motif overlay (white lines) */}
      <path d="M9 10L12 7L15 10" stroke="white" strokeWidth={1.5} />
      <path d="M10 11V17" stroke="white" strokeWidth={1.5} />
      <path d="M12 10V17" stroke="white" strokeWidth={1.5} />
      <path d="M14 11V17" stroke="white" strokeWidth={1.5} />
      <path d="M8 17H16" stroke="white" strokeWidth={1.5} />
    </svg>
  );
};
