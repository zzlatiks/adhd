import React, { useState } from 'react';
import { Task } from '../types';
import Icon from './Icon';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onToggleSubtask, 
  onAddSubtask, 
  onDeleteSubtask 
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const hasSubtasks = task.subtasks.length > 0;
  const isMainTaskCompleted = hasSubtasks ? task.subtasks.every(s => s.completed) : task.completed;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}м` : `${hours}ч`;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
      <div
        className={`flex items-center p-4 transition-all duration-300 ${
          isMainTaskCompleted
            ? 'bg-green-50 border-green-300'
            : 'bg-white'
        }`}
      >
        <button
          onClick={() => hasSubtasks ? setShowSubtasks(!showSubtasks) : onToggle(task.id)}
          className={`flex-shrink-0 w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300 mr-4 ${
            isMainTaskCompleted
              ? 'bg-green-500 border-green-500 text-white transform scale-110'
              : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
          }`}
        >
          {isMainTaskCompleted ? (
            <Icon name="Check" size={24} className="animate-bounce" />
          ) : hasSubtasks ? (
            <Icon name={showSubtasks ? "ChevronUp" : "ChevronDown"} size={24} />
          ) : (
            <Icon name="Circle" size={24} />
          )}
        </button>

        <div className="flex-1 flex items-center">
          <div className="mr-3 text-blue-500">
            <Icon name={task.icon} size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-semibold transition-all duration-300 ${
                  isMainTaskCompleted
                    ? 'text-green-700 line-through'
                    : 'text-gray-800'
                }`}
              >
                {task.title}
              </span>
              {task.estimatedMinutes && (
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  <Icon name="Clock" size={14} className="inline mr-1" />
                  {formatTime(task.estimatedMinutes)}
                </span>
              )}
            </div>
            {hasSubtasks && (
              <div className="mt-1 text-sm text-gray-600">
                {completedSubtasks} из {task.subtasks.length} подзадач выполнено
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSubtasks && (
            <button
              onClick={() => setShowAddSubtask(!showAddSubtask)}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600 flex items-center justify-center transition-all duration-200"
              title="Добавить подзадачу"
            >
              <Icon name="Plus" size={16} />
            </button>
          )}
          
          <button
            onClick={() => onDelete(task.id)}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200"
          >
            <Icon name="Trash2" size={18} />
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
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-3 ${
                    subtask.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
                  }`}
                >
                  {subtask.completed ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <Icon name="Circle" size={16} />
                  )}
                </button>
                
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
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className="flex-shrink-0 w-6 h-6 rounded bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200"
                >
                  <Icon name="X" size={12} />
                </button>
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

      {/* Add Subtask Button for tasks without subtasks */}
      {!hasSubtasks && (
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => setShowAddSubtask(!showAddSubtask)}
            className="w-full p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
          >
            <Icon name="Plus" size={16} />
            Добавить подзадачи
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskItem;