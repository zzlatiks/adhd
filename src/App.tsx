import { useState, useEffect, useMemo, useCallback } from 'react';
import type React from 'react';
import { Task, Subtask } from './types';
import TaskItem from './components/TaskItem';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
import ProgressBar from './components/ProgressBar';
import Icon from './components/Icon';

// Removed categories - now using task types instead

const initialTasks: Task[] = [
  {
    id: '2',
    title: 'Подготовка к школе',
    completed: false,
    icon: 'Activity',
    createdAt: new Date(),
    subtasks: [
      { id: '2-1', title: 'Домашнее задание', completed: false, createdAt: new Date() },
      { id: '2-2', title: 'Собрать портфель', completed: false, createdAt: new Date() }
    ]
  },
  {
    id: '5',
    title: 'Домашние дела',
    completed: false,
    icon: 'Home',
    createdAt: new Date(),
    subtasks: [
      { id: '5-1', title: 'Разобрать посуду', completed: false, createdAt: new Date() },
      { id: '5-2', title: 'Уход за животными', completed: false, createdAt: new Date() }
    ]
  },
  {
    id: '3',
    title: 'Подготовка ко сну',
    completed: false,
    icon: 'Moon',
    createdAt: new Date(),
    estimatedMinutes: 15,
    subtasks: [
      { id: '3-1', title: 'Убрать вещи', completed: false, createdAt: new Date() },
      { id: '3-2', title: 'Помыться', completed: false, createdAt: new Date() },
      { id: '3-3', title: 'Почистить зубы', completed: false, createdAt: new Date() }
    ]
  },
  {
    id: '4',
    title: 'Тренировка / Занятие',
    completed: false,
    icon: 'Shirt',
    createdAt: new Date(),
    subtasks: []
  }
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Touch state for mobile drag and drop
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  
  // JSON export/import states
  const [showExportJson, setShowExportJson] = useState(false);
  const [exportJsonData, setExportJsonData] = useState('');

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
        timerStartTime: task.timerStartTime ? new Date(task.timerStartTime) : undefined,
        // Reset running timers on reload to avoid stale state
        isTimerRunning: false,
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

  const addTask = (title: string, icon: string, estimatedMinutes?: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      icon,
      createdAt: new Date(),
      subtasks: [],
      estimatedMinutes,
      progress: 0
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, title: string, icon: string, estimatedMinutes?: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, title, icon, estimatedMinutes }
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
    try {
      const tasksToExport = tasks.map(task => {
        const { progress, completed, ...taskWithoutProgress } = task;
        return {
          ...taskWithoutProgress,
          completed: false, // Always export as incomplete
          subtasks: task.subtasks.map(subtask => {
            const { completed, ...subtaskWithoutCompleted } = subtask;
            return {
              ...subtaskWithoutCompleted,
              completed: false // Always export subtasks as incomplete
            };
          })
        };
      });
      
      const dataToExport = {
        tasks: tasksToExport,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      console.log('Data prepared for export:', dataToExport);
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], {
        type: 'application/json'
      });
      
      console.log('Blob created, size:', blob.size);
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      console.log('Device detection:', { isIOS, isSafari });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `adhd-tasks-${new Date().toISOString().split('T')[0]}.json`;
      
      if (isIOS && isSafari) {
        // Для iOS Safari - пробуем стандартный метод, если не работает - показываем JSON на странице
        console.log('Using iOS Safari method');
        
        try {
          link.target = '_blank';
          link.removeAttribute('download');
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Показываем инструкцию пользователю
          setTimeout(() => {
            if (confirm('Файл должен был открыться в новой вкладке. Если этого не произошло, нажмите OK для показа данных на экране.')) {
              // Показываем JSON на странице
              setExportJsonData(jsonString);
              setShowExportJson(true);
            }
          }, 2000);
          
        } catch (error) {
          console.log('iOS Safari method failed, showing JSON on page');
          // Показываем JSON на странице как резервный вариант
          setExportJsonData(jsonString);
          setShowExportJson(true);
        }
        
      } else {
        // Стандартный метод скачивания
        console.log('Using standard download method');
        link.style.display = 'none';
        
        document.body.appendChild(link);
        console.log('Triggering download click');
        link.click();
        document.body.removeChild(link);
        console.log('Download completed');
      }
      
      // Освобождаем URL в любом случае
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
      
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка экспорта: ' + errorMessage);
    }
  };

  const validateImportedTasks = (data: any): Task[] => {
    if (!Array.isArray(data)) {
      throw new Error('Данные должны содержать массив задач');
    }
    
    const usedTaskIds = new Set<string>();
    const currentTime = Date.now();
    
    return data.map((task: any, taskIndex: number) => {
      if (!task.id || !task.title) {
        throw new Error(`Задача #${taskIndex + 1} имеет неправильный формат`);
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
        completed: false, // Always import as incomplete
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
            completed: false, // Always import subtasks as incomplete
            createdAt: subtask.createdAt ? new Date(subtask.createdAt) : new Date()
          };
        }) : [],
        estimatedMinutes: task.estimatedMinutes ? Number(task.estimatedMinutes) : undefined
        // Progress will be recalculated automatically by useEffect
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

  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedTaskId) return;
    
    const draggedIndex = allTasks.findIndex(task => task.id === draggedTaskId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedTaskId(null);
      setDragOverIndex(null);
      return;
    }

    // Get the target task ID from the visible list
    const targetTaskId = allTasks[targetIndex]?.id;
    if (!targetTaskId) {
      setDraggedTaskId(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder in the full tasks array without losing hidden tasks
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const fullDraggedIndex = newTasks.findIndex(task => task.id === draggedTaskId);
      const fullTargetIndex = newTasks.findIndex(task => task.id === targetTaskId);
      
      if (fullDraggedIndex === -1 || fullTargetIndex === -1) return prevTasks;
      
      // Move dragged task to target position
      const [draggedTask] = newTasks.splice(fullDraggedIndex, 1);
      newTasks.splice(fullTargetIndex, 0, draggedTask);
      
      return newTasks;
    });
    
    setDraggedTaskId(null);
    setDragOverIndex(null);
  };

  // Touch handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setDraggedTaskId(taskId);
    setIsTouchDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedTaskId || touchStartY === null) return;
    
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    
    // Start dragging if moved more than 10px
    if (Math.abs(touch.clientY - touchStartY) > 10 && !isTouchDragging) {
      setIsTouchDragging(true);
    }
    
    if (isTouchDragging) {
      // Find the task element under the touch point
      const taskElements = document.querySelectorAll('[data-task-index]');
      let targetIndex = null;
      
      for (let i = 0; i < taskElements.length; i++) {
        const element = taskElements[i] as HTMLElement;
        const rect = element.getBoundingClientRect();
        
        if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          targetIndex = parseInt(element.getAttribute('data-task-index') || '0');
          break;
        }
      }
      
      setDragOverIndex(targetIndex);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedTaskId || !isTouchDragging) {
      // Reset touch state
      setDraggedTaskId(null);
      setTouchStartY(null);
      setIsTouchDragging(false);
      setDragOverIndex(null);
      return;
    }
    
    const touch = e.changedTouches[0];
    
    // Find the target index based on touch position
    const taskElements = document.querySelectorAll('[data-task-index]');
    let targetIndex = null;
    
    for (let i = 0; i < taskElements.length; i++) {
      const element = taskElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        targetIndex = parseInt(element.getAttribute('data-task-index') || '0');
        break;
      }
    }
    
    if (targetIndex !== null) {
      const draggedIndex = allTasks.findIndex(task => task.id === draggedTaskId);
      
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        // Get the target task ID from the visible list
        const targetTaskId = allTasks[targetIndex]?.id;
        
        if (targetTaskId) {
          // Reorder in the full tasks array without losing hidden tasks
          setTasks(prevTasks => {
            const newTasks = [...prevTasks];
            const fullDraggedIndex = newTasks.findIndex(task => task.id === draggedTaskId);
            const fullTargetIndex = newTasks.findIndex(task => task.id === targetTaskId);
            
            if (fullDraggedIndex === -1 || fullTargetIndex === -1) return prevTasks;
            
            // Move dragged task to target position
            const [draggedTask] = newTasks.splice(fullDraggedIndex, 1);
            newTasks.splice(fullTargetIndex, 0, draggedTask);
            
            return newTasks;
          });
        }
      }
    }
    
    // Reset touch state
    setDraggedTaskId(null);
    setTouchStartY(null);
    setIsTouchDragging(false);
    setDragOverIndex(null);
  };

  // Timer handlers
  const startTimer = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              isTimerRunning: true,
              timerStartTime: new Date(),
              timeSpent: task.timeSpent || 0
            }
          : task
      )
    );
  }, []);

  const stopTimer = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId && task.isTimerRunning && task.timerStartTime) {
          const now = new Date();
          const additionalTime = (now.getTime() - task.timerStartTime.getTime()) / (1000 * 60); // Convert to minutes
          return {
            ...task,
            isTimerRunning: false,
            timerStartTime: undefined,
            timeSpent: (task.timeSpent || 0) + additionalTime
          };
        }
        return task;
      })
    );
  }, []);


  // Auto-update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.isTimerRunning && task.timerStartTime) {
            // Force re-render to update display
            return { ...task };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Memoized computed values
  const completedTasks = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const totalTasks = useMemo(() => tasks.length, [tasks]);
  

  // Memoized task filtering
  const allTasks = useMemo(() => {
    if (showCompletedTasks) {
      return tasks;
    }
    return tasks.filter(task => !task.completed);
  }, [tasks, showCompletedTasks]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">


        {/* All Tasks */}
        {allTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-lg border-2 border-gray-100 mb-4 sm:mb-6">
            {/* Progress Bar at top */}
            <div className="mb-6">
              <ProgressBar completed={completedTasks} total={totalTasks} />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {allTasks.map((task, index) => (
                <div
                  key={task.id}
                  data-task-index={index}
                  draggable="true"
                  onDragStart={() => handleDragStart(task.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, task.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`cursor-move touch-pan-y transition-all duration-200 ${
                    dragOverIndex === index ? 'scale-105 shadow-xl' : ''
                  } ${
                    draggedTaskId === task.id ? (isTouchDragging ? 'opacity-70 scale-105' : 'opacity-50') : ''
                  }`}
                  data-testid={`task-card-${task.id}`}
                >
                  <TaskItem
                    task={task}
                    index={index}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onToggleSubtask={toggleSubtask}
                    onAddSubtask={addSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onEdit={handleEditTask}
                    onEditSubtask={editSubtask}
                    onStartTimer={startTimer}
                    onStopTimer={stopTimer}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Блок кнопок управления - перемещен вниз */}
        <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-lg border-2 border-gray-100 mb-4 sm:mb-6">
          <div className="flex gap-2 items-center justify-center flex-wrap">
            {/* Кнопка добавления задачи */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 h-10 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              title="Добавить задачу"
              data-testid="button-add-task"
            >
              <Icon name="Plus" size={20} className="sm:size-6" />
            </button>
            
            <button
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
              className="px-3 sm:px-4 h-10 sm:h-12 min-w-[44px] sm:min-w-[56px] rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold"
              title={showCompletedTasks ? 'Скрыть выполненные' : 'Показать выполненные'}
              data-testid="button-toggle-completed"
            >
              <Icon name={showCompletedTasks ? "Eye" : "EyeOff"} size={16} className="sm:size-5" />
            </button>
            
            <button
              onClick={exportTasks}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 h-10 sm:h-12 min-w-[44px] sm:min-w-[56px] rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              title="Экспорт задач"
              data-testid="button-export"
            >
              <Icon name="Upload" size={16} className="sm:size-5" />
            </button>
            
            <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 sm:px-4 h-10 sm:h-12 min-w-[44px] sm:min-w-[56px] rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer font-semibold" title="Импорт задач">
              <Icon name="Download" size={16} className="sm:size-5" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportTasks}
                className="hidden"
                data-testid="input-import"
              />
            </label>
            
            {/* Кнопка "Новый день" */}
            <button
              onClick={handleNewDay}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 h-10 sm:h-12 min-w-[44px] sm:min-w-[56px] rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              title="Новый день"
              data-testid="button-new-day"
            >
              <Icon name="RefreshCw" size={16} className="sm:size-5" />
            </button>
          </div>
        </div>

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

        {/* Export JSON Modal for iOS Safari */}
        {showExportJson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Данные задач</h2>
                <button
                  onClick={() => setShowExportJson(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  data-testid="button-close-export-json"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Скопируйте данные ниже и сохраните в файл с расширением .json:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[60vh] mb-4">
                <textarea
                  value={exportJsonData}
                  readOnly
                  className="w-full h-full min-h-[400px] bg-transparent border-none outline-none text-sm font-mono text-gray-700 resize-none"
                  data-testid="textarea-export-json"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportJsonData).then(() => {
                      alert('Данные скопированы в буфер обмена!');
                    }).catch(() => {
                      alert('Не удалось скопировать. Выделите и скопируйте текст вручную.');
                    });
                  }}
                  className="flex-1 p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  data-testid="button-copy-export-json"
                >
                  Скопировать
                </button>
                <button
                  onClick={() => setShowExportJson(false)}
                  className="p-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors px-6"
                  data-testid="button-close-export-json-bottom"
                >
                  Закрыть
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