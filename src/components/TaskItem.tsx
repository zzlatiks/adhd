import React, { useState, memo } from 'react';
import { Task } from '../types';
import Icon from './Icon';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (taskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  index,
  onToggle, 
  onDelete, 
  onToggleSubtask, 
  onAddSubtask, 
  onDeleteSubtask,
  onEdit,
  onEditSubtask,
  onStartTimer,
  onStopTimer,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Закрываем меню при клике вне его
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showActionsMenu) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionsMenu]);

  const hasSubtasks = task.subtasks.length > 0;
  const isMainTaskCompleted = hasSubtasks ? task.subtasks.every(s => s.completed) : task.completed;
  const progressPercentage = task.progress || 0;

  // Функция для получения цвета задачи на основе индекса для чередования
  const getTaskColor = () => {
    const colors = [
      'border-blue-200 bg-blue-50',
      'border-purple-200 bg-purple-50',
      'border-pink-200 bg-pink-50',
      'border-teal-200 bg-teal-50',
      'border-indigo-200 bg-indigo-50',
      'border-orange-200 bg-orange-50',
      'border-yellow-200 bg-yellow-50',
      'border-green-200 bg-green-50'
    ];
    // Используем индекс для последовательного чередования цветов
    return colors[index % colors.length];
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleAddSubtask called', { 
      taskId: task.id, 
      title: newSubtaskTitle.trim(), 
      hasSubtasks: task.subtasks.length > 0,
      showSubtasks,
      showAddSubtask 
    });
    if (newSubtaskTitle.trim()) {
      console.log('Calling onAddSubtask...');
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
      console.log('handleAddSubtask completed');
    } else {
      console.log('Empty title, not adding subtask');
    }
  };

  const handleEditSubtask = (subtaskId: string, currentTitle: string) => {
    setEditingSubtaskId(subtaskId);
    setEditingSubtaskTitle(currentTitle);
  };

  const handleSaveSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubtaskTitle.trim() && editingSubtaskId) {
      onEditSubtask(task.id, editingSubtaskId, editingSubtaskTitle.trim());
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
    }
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };


  // Calculate current timer value
  const getCurrentTimerValue = () => {
    if (!task.isTimerRunning || !task.timerStartTime) {
      return task.timeSpent || 0;
    }
    const now = new Date();
    const additionalTime = (now.getTime() - task.timerStartTime.getTime()) / (1000 * 60);
    return (task.timeSpent || 0) + additionalTime;
  };

  const currentTimeSpent = getCurrentTimerValue();
  const isOvertime = task.estimatedMinutes && currentTimeSpent > task.estimatedMinutes;

  const formatTimerDisplay = (minutes: number) => {
    const totalSeconds = Math.floor(Math.abs(minutes) * 60);
    const displayHours = Math.floor(totalSeconds / 3600);
    const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
    const displaySeconds = totalSeconds % 60;
    
    const timeString = displayHours > 0 
      ? `${displayHours}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
      : `${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`;
    
    // Add minus sign for overtime
    return minutes < 0 ? `-${timeString}` : timeString;
  };

  // Calculate remaining time for countdown
  const getRemainingTime = () => {
    if (!task.estimatedMinutes) return 0;
    return task.estimatedMinutes - currentTimeSpent;
  };

  const remainingTime = getRemainingTime();

  // Get timer color based on remaining time percentage
  const getTimerColor = () => {
    if (!task.estimatedMinutes) return 'bg-gray-100 text-gray-700';
    
    const remainingPercentage = Math.max(0, remainingTime / task.estimatedMinutes);
    
    if (remainingTime <= 0) {
      return 'bg-red-200 text-red-800'; // Overtime
    } else if (remainingPercentage <= 0.2) {
      return 'bg-red-100 text-red-700'; // 20% or less remaining
    } else if (remainingPercentage <= 0.5) {
      return 'bg-yellow-100 text-yellow-700'; // 50% or less remaining
    } else if (task.isTimerRunning) {
      return 'bg-green-100 text-green-700'; // Running
    } else {
      return 'bg-gray-100 text-gray-700'; // Not running
    }
  };

  // Auto-stop timer when time runs out
  React.useEffect(() => {
    if (task.isTimerRunning && task.estimatedMinutes && remainingTime <= 0) {
      onStopTimer(task.id);
    }
  }, [task.isTimerRunning, task.estimatedMinutes, remainingTime, onStopTimer, task.id]);

  return (
    <div 
      className={`rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 relative cursor-pointer ${
      isMainTaskCompleted 
        ? 'bg-green-50 border-green-200' 
        : isOvertime 
          ? 'bg-red-50 border-red-300' 
          : getTaskColor()
    }`}
      onClick={!hasSubtasks ? (e) => {
        e.preventDefault();
        // Не переключаем задачу если открыто меню действий или форма добавления подзадач
        if (showActionsMenu || showAddSubtask) return;
        onToggle(task.id);
      } : undefined}
    >
      <div className="flex items-center p-2 sm:p-4 transition-all duration-300 relative">
        {hasSubtasks ? (
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex-shrink-0 w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] sm:min-w-[48px] rounded-lg bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 flex items-center justify-center transition-all duration-300 mr-1 sm:mr-4"
            data-testid={`button-expand-${task.id}`}
            title={showSubtasks ? 'Скрыть подзадачи' : 'Показать подзадачи'}
          >
            <Icon name={showSubtasks ? "ChevronUp" : "ChevronDown"} size={12} className="sm:size-4" />
          </button>
        ) : (
          <div
            className={`flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 min-w-[32px] sm:min-w-[40px] rounded-full border-2 sm:border-3 flex items-center justify-center transition-all duration-300 mr-2 sm:mr-4 ${
              isMainTaskCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
            }`}
            data-testid={`button-toggle-${task.id}`}
          >
            {isMainTaskCompleted ? (
              <Icon name="Check" size={10} className="text-white sm:size-4" />
            ) : (
              <Icon name="Circle" size={10} className="sm:size-4" />
            )}
          </div>
        )}

        <div className="flex-1 flex items-center">
          <div className="hidden sm:block mr-3 text-blue-500">
            <Icon name={task.icon} size={28} />
          </div>
          <div className="flex-1">
            <div 
              className={`flex items-center gap-2 ${hasSubtasks ? 'cursor-pointer' : ''}`}
              onClick={hasSubtasks ? () => setShowSubtasks(!showSubtasks) : undefined}
            >
              <span className={`text-sm sm:text-lg font-semibold transition-all duration-300 ${
                isMainTaskCompleted ? 'text-green-700 line-through' : isOvertime ? 'text-red-700' : 'text-gray-800'
              }`}>
                {task.title}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col gap-1 sm:gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Верхняя строка: время (занимает 2 места если есть) */}
          {task.estimatedMinutes && (
            <div className="flex items-center">
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  task.isTimerRunning ? onStopTimer(task.id) : onStartTimer(task.id);
                }}
                className={`flex-shrink-0 w-full h-11 sm:h-12 min-h-[44px] sm:min-h-[48px] rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 font-medium cursor-pointer transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                  getTimerColor()
                }`}
                title={task.isTimerRunning ? 'Остановить таймер' : 'Запустить таймер'}
              >
                <Icon name="Clock" size={14} className="mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">{formatTimerDisplay(remainingTime)}</span>
              </span>
            </div>
          )}
          
          {/* Нижняя строка: + и ⋮ */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!showSubtasks) {
                  setShowSubtasks(true);
                }
                setShowAddSubtask(!showAddSubtask);
              }}
              className="flex-shrink-0 w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] sm:min-w-[48px] rounded-lg bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600 flex items-center justify-center transition-all duration-200"
              title="Добавить подзадачу"
              data-testid={`button-add-subtask-${task.id}`}
            >
              <Icon name="Plus" size={14} className="sm:size-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowActionsMenu(!showActionsMenu);
                }}
                className="flex-shrink-0 w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] sm:min-w-[48px] rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center transition-all duration-200"
                title="Действия"
                data-testid={`button-actions-${task.id}`}
              >
                <Icon name="MoreVertical" size={14} className="sm:size-5" />
              </button>
              
              {/* Выпадающее меню */}
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(task.id);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 first:rounded-t-lg"
                    data-testid={`menu-edit-${task.id}`}
                  >
                    <Icon name="Pencil" size={14} />
                    Изменить
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(task.id);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 last:rounded-b-lg border-t border-gray-100"
                    data-testid={`menu-delete-${task.id}`}
                  >
                    <Icon name="Trash2" size={14} />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section for subtasks - показывается под кнопками управления */}
      {hasSubtasks && (
        <div className="px-2 pb-2 sm:px-4 sm:pb-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Subtasks Section */}
      {showSubtasks && hasSubtasks && (
        <div className="border-t border-gray-200 p-2 sm:p-4 bg-gray-50">
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`flex items-center p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                  subtask.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
              >
                <button
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                  className={`flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 min-w-[32px] sm:min-w-[40px] rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-2 sm:mr-3 ${
                    subtask.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
                  }`}
                  data-testid={`button-toggle-subtask-${subtask.id}`}
                >
                  {subtask.completed ? (
                    <Icon name="Check" size={18} />
                  ) : (
                    <Icon name="Circle" size={18} />
                  )}
                </button>
                
                {editingSubtaskId === subtask.id ? (
                  <form onSubmit={handleSaveSubtask} className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      className="flex-1 p-1 border border-gray-300 rounded text-sm focus:border-blue-400 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all duration-200"
                      title="Сохранить"
                    >
                      <Icon name="Check" size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditSubtask}
                      className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                      title="Отмена"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </form>
                ) : (
                  <>
                    <span
                      className={`flex-1 text-sm font-medium transition-all duration-200 ${
                        subtask.completed
                          ? 'text-green-700 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {subtask.title}
                    </span>
                    
                    <button
                      onClick={() => handleEditSubtask(subtask.id, subtask.title)}
                      className="flex-shrink-0 w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] sm:min-w-[48px] rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700 flex items-center justify-center transition-all duration-200 mr-1"
                      title="Изменить подзадачу"
                      data-testid={`button-edit-subtask-${subtask.id}`}
                    >
                      <Icon name="Pencil" size={14} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteSubtask(task.id, subtask.id)}
                      className="flex-shrink-0 w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] sm:min-w-[48px] rounded bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200"
                      data-testid={`button-delete-subtask-${subtask.id}`}
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Subtask Form - показывается когда нажата кнопка добавления подзадач */}
      {showAddSubtask && (
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-blue-50">
          <form onSubmit={handleAddSubtask} className="flex gap-2 items-start">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Название подзадачи..."
              className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none text-sm min-h-[40px] max-w-full"
              autoFocus
            />
            <button
              type="submit"
              onClick={() => {
                console.log('Submit button clicked', { 
                  disabled: !newSubtaskTitle.trim(),
                  title: newSubtaskTitle,
                  trimmed: newSubtaskTitle.trim()
                });
              }}
              className="w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] min-h-[44px] rounded bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newSubtaskTitle.trim()}
              title="Добавить"
              data-testid={`button-add-subtask-submit-${task.id}`}
            >
              <Icon name="Check" size={16} />
            </button>
            <button
              type="button"
              onClick={() => setShowAddSubtask(false)}
              className="w-11 sm:w-12 h-11 sm:h-12 min-w-[44px] min-h-[44px] rounded bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 flex-shrink-0"
              title="Отмена"
              data-testid={`button-add-subtask-cancel-${task.id}`}
            >
              <Icon name="X" size={16} />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default memo(TaskItem);