import React, { useState, memo } from 'react';
import { Task } from '../types';
import Icon from './Icon';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (taskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  onMoveUp: (taskId: string) => void;
  onMoveDown: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onToggleSubtask, 
  onAddSubtask, 
  onDeleteSubtask,
  onEdit,
  onEditSubtask,
  onStartTimer,
  onStopTimer,
  onMoveUp,
  onMoveDown 
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const hasSubtasks = task.subtasks.length > 0;
  const isMainTaskCompleted = hasSubtasks ? task.subtasks.every(s => s.completed) : task.completed;
  const progressPercentage = task.progress || 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
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
    <div className={`rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
      isMainTaskCompleted 
        ? 'bg-green-50 border-green-200' 
        : isOvertime 
          ? 'bg-red-50 border-red-300' 
          : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center p-3 sm:p-4 transition-all duration-300 relative">
        <button
          onClick={() => hasSubtasks ? setShowSubtasks(!showSubtasks) : onToggle(task.id)}
          className={`flex-shrink-0 w-10 sm:w-14 h-10 sm:h-14 min-w-[40px] sm:min-w-[56px] rounded-full border-3 flex items-center justify-center transition-all duration-300 mr-2 sm:mr-4 ${
            hasSubtasks 
              ? 'bg-white border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600' 
              : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
          }`}
          data-testid={`button-toggle-${task.id}`}
        >
          {hasSubtasks ? (
            <Icon name={showSubtasks ? "ChevronUp" : "ChevronDown"} size={20} className="sm:size-6" />
          ) : isMainTaskCompleted ? (
            <Icon name="Check" size={20} className="text-green-500 sm:size-6" />
          ) : (
            <Icon name="Circle" size={20} className="sm:size-6" />
          )}
        </button>

        <div className="flex-1 flex items-center">
          <div className="mr-3 text-blue-500">
            <Icon name={task.icon} size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-base sm:text-lg font-semibold transition-all duration-300 ${
                isMainTaskCompleted ? 'text-green-700 line-through' : isOvertime ? 'text-red-700' : 'text-gray-800'
              }`}>
                {task.title}
              </span>
              {task.estimatedMinutes && (
                <span 
                  onClick={() => task.isTimerRunning ? onStopTimer(task.id) : onStartTimer(task.id)}
                  className={`text-xs sm:text-sm px-1 sm:px-2 py-1 rounded-full font-medium cursor-pointer transition-all duration-200 hover:scale-105 ${
                    getTimerColor()
                  }`}
                  title={task.isTimerRunning ? 'Остановить таймер' : 'Запустить таймер'}
                >
                  <Icon name="Clock" size={14} className="inline mr-1" />
                  {formatTimerDisplay(remainingTime)}
                </span>
              )}
            </div>
            {hasSubtasks && (
              <div className="mt-1">
                <div className="text-sm text-gray-600 mb-1">
                  {completedSubtasks} из {task.subtasks.length} подзадач выполнено
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2">
          <button
            onClick={() => setShowAddSubtask(!showAddSubtask)}
            className="flex-shrink-0 w-9 sm:w-12 h-9 sm:h-12 min-w-[36px] sm:min-w-[48px] rounded-lg bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600 flex items-center justify-center transition-all duration-200"
            title="Добавить подзадачу"
            data-testid={`button-add-subtask-${task.id}`}
          >
            <Icon name="Plus" size={16} className="sm:size-5" />
          </button>
          
          
          <button
            onClick={() => onEdit(task.id)}
            className="flex-shrink-0 w-9 sm:w-12 h-9 sm:h-12 min-w-[36px] sm:min-w-[48px] rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700 flex items-center justify-center transition-all duration-200"
            title="Редактировать задачу"
            data-testid={`button-edit-${task.id}`}
          >
            <Icon name="Pencil" size={16} className="sm:size-5" />
          </button>
          
          <button
            onClick={() => onMoveUp(task.id)}
            className="flex-shrink-0 w-9 sm:w-12 h-9 sm:h-12 min-w-[36px] sm:min-w-[48px] rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-700 flex items-center justify-center transition-all duration-200"
            title="Переместить вверх"
            data-testid={`button-move-up-${task.id}`}
          >
            <Icon name="ArrowUp" size={16} className="sm:size-5" />
          </button>
          
          <button
            onClick={() => onMoveDown(task.id)}
            className="flex-shrink-0 w-9 sm:w-12 h-9 sm:h-12 min-w-[36px] sm:min-w-[48px] rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 flex items-center justify-center transition-all duration-200"
            title="Переместить вниз"
            data-testid={`button-move-down-${task.id}`}
          >
            <Icon name="ArrowDown" size={16} className="sm:size-5" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="flex-shrink-0 w-9 sm:w-12 h-9 sm:h-12 min-w-[36px] sm:min-w-[48px] rounded-lg bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200"
            data-testid={`button-delete-${task.id}`}
          >
            <Icon name="Trash2" size={16} className="sm:size-5" />
          </button>
        </div>
      </div>

      {/* Subtasks Section */}
      {showSubtasks && hasSubtasks && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                  subtask.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
              >
                <button
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                  className={`flex-shrink-0 w-10 h-10 min-w-[40px] rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-3 ${
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
                      className="w-6 h-6 rounded bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all duration-200"
                      title="Сохранить"
                    >
                      <Icon name="Check" size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditSubtask}
                      className="w-6 h-6 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
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
                      className="flex-shrink-0 w-10 h-10 min-w-[40px] rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700 flex items-center justify-center transition-all duration-200 mr-1"
                      title="Редактировать подзадачу"
                      data-testid={`button-edit-subtask-${subtask.id}`}
                    >
                      <Icon name="Pencil" size={14} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteSubtask(task.id, subtask.id)}
                      className="flex-shrink-0 w-10 h-10 min-w-[40px] rounded bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200"
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

      {/* Add Subtask Form */}
      {showAddSubtask && (
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Название подзадачи..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setShowAddSubtask(false)}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
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