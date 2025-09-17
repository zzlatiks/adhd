import React from 'react';
import Icon from './Icon';

interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const stars = Math.floor(percentage / 20);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Мой прогресс</h2>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              name="Star"
              size={24}
              className={i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-1">
          <span>Выполнено задач</span>
          <span>{completed} из {total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center">
        {percentage === 100 ? (
          <div className="flex items-center justify-center text-green-600 font-bold">
            <Icon name="Trophy" className="mr-2 animate-bounce" size={24} />
            Все задачи выполнены! Молодец!
          </div>
        ) : (
          <p className="text-gray-600 font-semibold">
            {percentage}% готово! Продолжай в том же духе!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;