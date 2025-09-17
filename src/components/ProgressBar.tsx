import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className={`h-full transition-all duration-1000 ease-out ${
          percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
        }`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;