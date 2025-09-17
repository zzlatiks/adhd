import React from 'react';
import { Sun, CloudSun, Moon, Plus, Check, Circle, Trash2, Star, Trophy, ListTodo, X, CheckCircle2, BookOpen, Utensils, Shirt, Brush as Toothbrush, Gamepad2, Music, Palette, Home, Backpack, Activity, ChevronUp, ChevronDown, Clock } from 'lucide-react';

const iconMap = {
  Sun,
  CloudSun,
  Moon,
  Plus,
  Check,
  Circle,
  Trash2,
  Star,
  Trophy,
  ListTodo,
  X,
  CheckCircle2,
  BookOpen,
  Utensils,
  Shirt,
  Toothbrush,
  Gamepad2,
  Music,
  Palette,
  Home,
  Backpack,
  Activity,
  ChevronUp,
  ChevronDown,
  Clock
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const IconComponent = iconMap[name as keyof typeof iconMap] || Circle;
  return <IconComponent size={size} className={className} />;
};

export default Icon;