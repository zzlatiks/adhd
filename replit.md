# Overview

This is an ADHD Kids Task Manager application built as a React TypeScript web app. The application is designed to help children with ADHD manage their daily routines and tasks through a gamified, visually appealing interface. It features task tracking with progress visualization, subtask management, and motivational elements like star ratings and achievement badges.

# Recent Changes

- **September 18, 2025**: Mobile interface optimization completed - fixed three-dots menu functionality with proper event handling, reduced checkbox sizes from 44×44px to 32×40px for better visual balance, made task cards fully clickable for completion toggling, and resolved subtask form overlay issues by restricting display to expanded subtask states. Added comprehensive event propagation controls to prevent unintended interactions between UI elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling with PostCSS processing
- **Icons**: Lucide React for consistent iconography throughout the interface
- **State Management**: Local React state using hooks (useState, useEffect, useMemo, useCallback)

## Component Structure
The application follows a modular component architecture:
- **App.tsx**: Main application container managing global state and task operations
- **TaskItem**: Individual task rendering with subtask management
- **AddTaskModal/EditTaskModal**: Modal interfaces for task creation and modification
- **ProgressBar**: Visual progress tracking with star-based achievements
- **Icon**: Centralized icon management system
- **CategorySection**: Task organization by categories (currently being refactored to task types)

## Data Model
The application uses a simple but flexible data structure:
- **Task**: Core entity with title, type (daily/temporary), completion status, icon, creation date, subtasks, and time estimates
- **Subtask**: Sub-components of tasks with their own completion tracking
- **Task Types**: Moving from category-based organization to type-based (daily vs temporary tasks)

## UI/UX Design Patterns
- **Gamification**: Star ratings, progress bars, and achievement celebrations
- **Child-Friendly Interface**: Large buttons, colorful icons, and simple interactions
- **Responsive Design**: Mobile-first approach with proper touch targets
- **Visual Feedback**: Animations and state changes to provide immediate user feedback

## Development Environment
- **Linting**: ESLint with TypeScript support and React-specific rules
- **Code Quality**: Strict TypeScript configuration with comprehensive type checking
- **Development Server**: Vite dev server with hot module replacement

# External Dependencies

## Core Technologies
- **React 18.3.1**: Frontend framework for component-based UI development
- **React DOM 18.3.1**: DOM rendering library for React applications
- **TypeScript 5.9.2**: Static type checking for enhanced code quality

## UI and Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework for rapid UI development
- **PostCSS 8.5.6**: CSS processing with Autoprefixer 10.4.21 for browser compatibility
- **Lucide React 0.344.0**: Icon library providing consistent iconography

## Backend Services (Configured but Not Implemented)
- **Supabase 2.57.4**: Backend-as-a-Service platform for authentication and data storage (currently included in dependencies but not actively used in the current implementation)

## Development Tools
- **Vite 5.4.2**: Build tool and development server
- **ESLint 9.35.0**: Code linting with React Hooks and React Refresh plugins
- **TypeScript ESLint 8.44.0**: TypeScript-specific linting rules

## Build and Development
- **@vitejs/plugin-react 4.7.0**: Vite plugin for React support
- **Various TypeScript type definitions**: For React and React DOM

The application is currently in a transition phase, with Supabase configured for future backend integration but operating primarily with local state management. The architecture supports easy migration to persistent storage when backend integration is implemented.