import React, { useState } from 'react';
import Icon from './Icon';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, type: 'daily' | 'temporary', icon: string, estimatedMinutes?: number) => void;
}

const taskIcons = [
  'BookOpen', 'Utensils', 'Shirt', 'Toothbrush', 'Gamepad2', 
  'Music', 'Palette', 'Home', 'Backpack', 'Moon'
];

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'temporary'>('daily');
  const [selectedIcon, setSelectedIcon] = useState('Circle');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const minutes = estimatedMinutes === '' ? undefined : Number(estimatedMinutes);
      onAddTask(title.trim(), taskType, selectedIcon, minutes);
      setTitle('');
      setSelectedIcon('Circle');
      setEstimatedMinutes('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Добавить задачу</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название задачи
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-lg"
              placeholder="Например: Почистить зубы"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Тип задачи
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'daily', label: 'Ежедневная', color: 'bg-blue-100 text-blue-700' },
                { value: 'temporary', label: 'Временная', color: 'bg-green-100 text-green-700' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTaskType(option.value as 'daily' | 'temporary')}
                  className={`p-3 rounded-xl font-semibold transition-all ${
                    taskType === option.value
                      ? option.color + ' ring-2 ring-offset-2 ring-current'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Время выполнения (минуты)
            </label>
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-lg"
              placeholder="Например: 15"
              min="1"
              max="300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Оставь пустым, если не знаешь точное время
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Иконка
            </label>
            <div className="grid grid-cols-5 gap-2">
              {taskIcons.map((iconName) => {
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-xl transition-all ${
                      selectedIcon === iconName
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon name={iconName} size={24} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;