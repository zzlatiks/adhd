export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  category: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  icon: string;
  createdAt: Date;
  subtasks: Subtask[];
  estimatedMinutes?: number;
}

export interface TaskCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}