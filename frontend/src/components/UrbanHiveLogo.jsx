import React from 'react';

const UrbanHiveLogo = ({ className = '', size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M 25 35 L 40 20 L 40 70 Q 40 90, 85 90 Q 25 90, 25 65 Z" 
        fill="currentColor" 
      />
      <path 
        d="M 55 45 L 70 30 L 70 70 Q 60 70, 55 55 Z" 
        fill="currentColor" 
      />
    </svg>
  );
};

export default UrbanHiveLogo;
