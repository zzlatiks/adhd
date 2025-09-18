export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  icon: string;
  createdAt: Date;
  subtasks: Subtask[];
  estimatedMinutes?: number;
  progress?: number; // 0-100 based on subtask completion
  timerStartTime?: Date; // When timer was started
  isTimerRunning?: boolean; // Whether timer is currently running
  timeSpent?: number; // Time spent in minutes
}