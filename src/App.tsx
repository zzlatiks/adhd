import { useState, useEffect } from 'react';
import { Task, TaskCategory, Subtask } from './types';
import AddTaskModal from './components/AddTaskModal';
import ProgressBar from './components/ProgressBar';
import CategorySection from './components/CategorySection';
import Icon from './components/Icon';

const categories: TaskCategory[] = [
  {
    id: 'morning',
    name: 'Утренние дела',
    icon: 'Sun',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'afternoon',
    name: 'Дневные дела',
    icon: 'CloudSun',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'evening',
    name: 'Вечерние дела',
    icon: 'Moon',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Почистить зубы',
    category: 'morning',
    completed: false,
    icon: 'Toothbrush',
    createdAt: new Date(),
    subtasks: [],
    estimatedMinutes: 3
  },
  {
    id: '2',
    title: 'Сделать зарядку',
    category: 'morning',
    completed: false,
    icon: 'Activity',
    createdAt: new Date(),
    subtasks: [
      { id: '2-1', title: 'Разминка 5 минут', completed: false, createdAt: new Date() },
      { id: '2-2', title: 'Основные упражнения', completed: false, createdAt: new Date() }
    ],
    estimatedMinutes: 15
  },
  {
    id: '3',
    title: 'Позавтракать',
    category: 'morning',
    completed: false,
    icon: 'Utensils',
    createdAt: new Date(),
    subtasks: [],
    estimatedMinutes: 20
  },
  {
    id: '4',
    title: 'Сделать домашнее задание',
    category: 'afternoon',
    completed: false,
    icon: 'BookOpen',
    createdAt: new Date(),
    subtasks: [
      { id: '4-1', title: 'Математика', completed: false, createdAt: new Date() },
      { id: '4-2', title: 'Чтение', completed: false, createdAt: new Date() },
      { id: '4-3', title: 'Письмо', completed: false, createdAt: new Date() }
    ],
    estimatedMinutes: 60
  },
  {
    id: '5',
    title: 'Убрать игрушки',
    category: 'evening',
    completed: false,
    icon: 'Home',
    createdAt: new Date(),
    subtasks: [],
    estimatedMinutes: 10
  }
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('adhd-tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        subtasks: task.subtasks?.map((subtask: any) => ({
          ...subtask,
          createdAt: new Date(subtask.createdAt)
        })) || []
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('adhd-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          );
          const allSubtasksCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: allSubtasksCompleted
          };
        }
        return task;
      })
    );
  };

  const addSubtask = (taskId: string, subtaskTitle: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newSubtask: Subtask = {
            id: `${taskId}-${Date.now()}`,
            title: subtaskTitle,
            completed: false,
            createdAt: new Date()
          };
          return {
            ...task,
            subtasks: [...task.subtasks, newSubtask],
            completed: false
          };
        }
        return task;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
          const allSubtasksCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: updatedSubtasks.length === 0 ? task.completed : allSubtasksCompleted
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const addTask = (title: string, category: 'morning' | 'afternoon' | 'evening', icon: string, estimatedMinutes?: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category,
      completed: false,
      icon,
      createdAt: new Date(),
      subtasks: [],
      estimatedMinutes
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  const getCurrentDateFormatted = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('ru-RU', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Мои задачи
              </h1>
              <p className="text-gray-600 capitalize">
                {getCurrentDateFormatted()}
              </p>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Icon name="Plus" size={24} className="mr-2" />
              Добавить
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar completed={completedTasks} total={totalTasks} />

        {/* Task Categories */}
        {categories.map((category) => {
          const categoryTasks = tasks.filter(task => task.category === category.id);
          return (
            <CategorySection
              key={category.id}
              category={category}
              tasks={categoryTasks}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onToggleSubtask={toggleSubtask}
              onAddSubtask={addSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          );
        })}

        {/* Empty State */}
        {totalTasks === 0 && (
          <div className="text-center py-12">
            <Icon name="ListTodo" size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Пока нет задач
            </h3>
            <p className="text-gray-500 mb-6">
              Добавь свою первую задачу, чтобы начать!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Добавить задачу
            </button>
          </div>
        )}

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTask={addTask}
        />
      </div>
    </div>
  );
}

export default App;