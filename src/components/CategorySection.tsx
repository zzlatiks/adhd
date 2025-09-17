import React from 'react';
import { Task, TaskCategory } from '../types';
import TaskItem from './TaskItem';
import Icon from './Icon';

interface CategorySectionProps {
  category: TaskCategory;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  tasks,
  onToggleTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}) => {
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="mb-8">
      <div className={`${category.bgColor} rounded-2xl p-4 mb-4 border-2 ${category.color.replace('text-', 'border-')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`${category.color} mr-3`}>
              <Icon name={category.icon} size={32} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${category.color}`}>
                {category.name}
              </h3>
              <p className={`text-sm ${category.color} opacity-80`}>
                {completedTasks} из {tasks.length} выполнено
              </p>
            </div>
          </div>
          
          {completedTasks === tasks.length && tasks.length > 0 && (
            <div className="flex items-center text-green-600">
              <Icon name="CheckCircle2" size={28} className="animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onToggleSubtask={onToggleSubtask}
            onAddSubtask={onAddSubtask}
            onDeleteSubtask={onDeleteSubtask}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Plus" size={48} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold">Пока нет задач на это время</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;