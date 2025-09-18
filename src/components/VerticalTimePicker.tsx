import React from 'react';

interface VerticalTimePickerProps {
  value: number | '';
  onChange: (value: number | '') => void;
}

const VerticalTimePicker: React.FC<VerticalTimePickerProps> = ({ value, onChange }) => {
  // Варианты времени для выбора
  const timeOptions = [5, 10, 15, 30];
  
  // Текущее значение
  const currentValue = typeof value === 'number' ? value : 0;

  return (
    <div className="bg-gray-100 rounded-xl p-4 mb-3">
      {/* Кнопки выбора времени */}
      <div className="grid grid-cols-2 gap-3">
        {timeOptions.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={(e) => {
              // Предотвращаем всплытие события до формы
              e.preventDefault();
              e.stopPropagation();
              
              // Если нажали на уже выбранное время - сбрасываем его
              if (currentValue === minutes) {
                onChange('');
              } else {
                onChange(minutes);
              }
            }}
            className={`p-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
              currentValue === minutes
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
            }`}
            data-testid={`time-option-${minutes}`}
          >
            {minutes} мин
          </button>
        ))}
      </div>
    </div>
  );
};

export default VerticalTimePicker;