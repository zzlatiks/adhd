import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner relative">
      <div
        className={`h-full transition-all duration-1000 ease-out rounded-full relative overflow-hidden ${
          percentage === 100 
            ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600' 
            : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
        }`}
        style={{ width: `${percentage}%` }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 shadow-inner rounded-full"></div>
      </div>
    </div>
  );
};

export default ProgressBar;