import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Subtask } from './types';
import TaskItem from './components/TaskItem';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
import ProgressBar from './components/ProgressBar';
import Icon from './components/Icon';

// Removed categories - now using task types instead

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Почистить зубы',
    type: 'daily',
    completed: false,
    icon: 'Toothbrush',
    createdAt: new Date(),
    subtasks: [],
    estimatedMinutes: 3
  },
  {
    id: '2',
    title: 'Сделать зарядку',
    type: 'daily',
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
    type: 'daily',
    completed: false,
    icon: 'Utensils',
    createdAt: new Date(),
    subtasks: [],
    estimatedMinutes: 20
  },
  {
    id: '4',
    title: 'Сделать домашнее задание',
    type: 'temporary',
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
    type: 'daily',
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Calculate progress for tasks with subtasks
  const calculateProgress = (task: Task): number => {
    if (task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  // Update tasks with progress whenever tasks change
  useEffect(() => {
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        progress: calculateProgress(task)
      }))
    );
  }, [tasks.length, tasks.map(t => t.completed).join(','), tasks.map(t => t.subtasks.map(s => s.completed).join('')).join(',')]);

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

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
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
  }, []);

  const addSubtask = useCallback((taskId: string, subtaskTitle: string) => {
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
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
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
  }, []);

  const editSubtask = useCallback((taskId: string, subtaskId: string, newTitle: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, title: newTitle } : subtask
          );
          return {
            ...task,
            subtasks: updatedSubtasks
          };
        }
        return task;
      })
    );
  }, []);

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const addTask = (title: string, type: 'daily' | 'temporary', icon: string, estimatedMinutes?: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      type,
      completed: false,
      icon,
      createdAt: new Date(),
      subtasks: [],
      estimatedMinutes,
      progress: 0
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, title: string, type: 'daily' | 'temporary', icon: string, estimatedMinutes?: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, title, type, icon, estimatedMinutes }
          : task
      )
    );
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setIsEditModalOpen(true);
    }
  };

  // Export/Import functionality
  const exportTasks = () => {
    const dataToExport = {
      tasks: tasks,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adhd-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateImportedTasks = (data: any): Task[] => {
    if (!Array.isArray(data)) {
      throw new Error('Данные должны содержать массив задач');
    }
    
    const usedTaskIds = new Set<string>();
    const currentTime = Date.now();
    
    return data.map((task: any, taskIndex: number) => {
      if (!task.id || !task.title || !task.type) {
        throw new Error(`Задача #${taskIndex + 1} имеет неправильный формат`);
      }
      
      if (!['daily', 'temporary'].includes(task.type)) {
        throw new Error(`Задача #${taskIndex + 1} имеет неправильный тип`);
      }
      
      // Ensure unique task ID
      let taskId = task.id;
      if (usedTaskIds.has(taskId)) {
        taskId = `${task.id}-${currentTime}-${taskIndex}`;
      }
      usedTaskIds.add(taskId);
      
      const usedSubtaskIds = new Set<string>();
      
      return {
        id: taskId,
        title: task.title,
        type: task.type,
        completed: Boolean(task.completed),
        icon: ['BookOpen', 'Utensils', 'Shirt', 'Toothbrush', 'Gamepad2', 'Music', 'Palette', 'Home', 'Backpack', 'Moon', 'Activity', 'Circle'].includes(task.icon) ? task.icon : 'Circle',
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        subtasks: Array.isArray(task.subtasks) ? task.subtasks.map((subtask: any, subtaskIndex: number) => {
          let subtaskId = subtask.id || `${taskId}-subtask-${subtaskIndex}`;
          if (usedSubtaskIds.has(subtaskId)) {
            subtaskId = `${taskId}-subtask-${currentTime}-${subtaskIndex}`;
          }
          usedSubtaskIds.add(subtaskId);
          
          return {
            id: subtaskId,
            title: subtask.title || 'Без названия',
            completed: Boolean(subtask.completed),
            createdAt: subtask.createdAt ? new Date(subtask.createdAt) : new Date()
          };
        }) : [],
        estimatedMinutes: task.estimatedMinutes ? Number(task.estimatedMinutes) : undefined,
        progress: 0 // Always recalculate progress instead of importing
      };
    });
  };

  const handleImportTasks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      let tasksToImport: Task[];
      
      // Handle different export formats
      if (data.tasks && Array.isArray(data.tasks)) {
        // New format with metadata
        tasksToImport = validateImportedTasks(data.tasks);
      } else if (Array.isArray(data)) {
        // Legacy format - just array of tasks
        tasksToImport = validateImportedTasks(data);
      } else {
        throw new Error('Неправильный формат файла');
      }
      
      // Confirm import
      const confirmImport = window.confirm(
        `Вы хотите импортировать ${tasksToImport.length} задач? Это заменит все текущие задачи.`
      );
      
      if (confirmImport) {
        setTasks(tasksToImport);
        alert(`Успешно импортировано ${tasksToImport.length} задач!`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
    
    // Reset file input
    event.target.value = '';
  };

  // New day functionality
  const handleNewDay = useCallback(() => {
    setIsConfirmDialogOpen(true);
  }, []);

  const confirmNewDay = () => {
    setTasks(prevTasks => 
      prevTasks
        .filter(task => task.type === 'daily') // Keep only daily tasks
        .map(task => ({
          ...task,
          completed: false, // Reset completion status
          subtasks: task.subtasks.map(subtask => ({
            ...subtask,
            completed: false // Reset subtask completion
          })),
          progress: 0
        }))
    );
    setIsConfirmDialogOpen(false);
  };

  // Memoized computed values
  const completedTasks = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const totalTasks = useMemo(() => tasks.length, [tasks]);
  
  // Current date formatting (recomputed each render to stay current)
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

  // Memoized task filtering
  const getFilteredTasks = useCallback((taskType: 'daily' | 'temporary') => {
    const filteredByType = tasks.filter(task => task.type === taskType);
    if (showCompletedTasks) {
      return filteredByType;
    }
    return filteredByType.filter(task => !task.completed);
  }, [tasks, showCompletedTasks]);

  // Memoized filtered task lists
  const dailyTasks = useMemo(() => getFilteredTasks('daily'), [getFilteredTasks]);
  const temporaryTasks = useMemo(() => getFilteredTasks('temporary'), [getFilteredTasks]);
  const allTasks = useMemo(() => [...dailyTasks, ...temporaryTasks], [dailyTasks, temporaryTasks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* All Tasks */}
        {allTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 mb-6">
            {/* Progress Bar at top */}
            <div className="mb-6">
              <ProgressBar completed={completedTasks} total={totalTasks} />
            </div>
            
            <div className="space-y-3">
              {allTasks.map(task => (
                <div
                  key={task.id}
                  className={task.type === 'temporary' ? 'border-2 border-green-400 rounded-xl p-1' : ''}
                >
                  <TaskItem
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onToggleSubtask={toggleSubtask}
                    onAddSubtask={addSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onEdit={handleEditTask}
                    onEditSubtask={editSubtask}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 mb-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Мои задачи
              </h1>
              <p className="text-gray-600 capitalize">
                {getCurrentDateFormatted()}
              </p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className={`px-4 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  showCompletedTasks 
                    ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Icon name={showCompletedTasks ? "EyeOff" : "Eye"} size={20} className="mr-2" />
                {showCompletedTasks ? 'Скрыть' : 'Показать'}
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={exportTasks}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                  title="Экспорт задач"
                >
                  <Icon name="Download" size={20} className="mr-2" />
                  Экспорт
                </button>
                <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer">
                  <Icon name="Upload" size={20} className="mr-2" />
                  Импорт
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTasks}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                onClick={handleNewDay}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Icon name="RefreshCw" size={24} className="mr-2" />
                Новый день
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Icon name="Plus" size={24} className="mr-2" />
                Добавить
              </button>
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTask={addTask}
        />

        {/* Edit Task Modal */}
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          onUpdateTask={updateTask}
          task={editingTask}
        />

        {/* Confirmation Dialog */}
        {isConfirmDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Подтверждение</h2>
                <button
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Вы уверены, что хотите удалить прогресс?
                <br />
                <span className="text-sm text-gray-500">
                  Это действие сбросит все ежедневные задачи и удалит временные задачи.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmNewDay}
                  className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  Да, сбросить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;