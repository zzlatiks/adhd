import React, { useState, useRef, useEffect } from 'react';

interface VerticalTimePickerProps {
  value: number | '';
  onChange: (value: number) => void;
  onReset: () => void;
}

const VerticalTimePicker: React.FC<VerticalTimePickerProps> = ({ value, onChange, onReset }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create array of time values (0, 5, 10, 15, ... 120)
  const timeValues = Array.from({ length: 25 }, (_, i) => i * 5);
  
  // Current numeric value
  const numericValue = typeof value === 'number' ? value : 0;
  
  // Find current index
  const currentIndex = timeValues.indexOf(numericValue);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartValue(numericValue);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent modal scroll
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY; // Negative when swiping down, positive when swiping up
    
    // Each 40px of movement changes by 5 minutes (matching visual row height)
    const steps = Math.round(deltaY / 40);
    const newValue = Math.max(0, Math.min(120, startValue + (steps * 5)));
    
    if (newValue !== numericValue) {
      onChange(newValue);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to nearest value
    const nearestIndex = Math.round(numericValue / 5);
    const snappedValue = Math.max(0, Math.min(120, nearestIndex * 5));
    if (snappedValue !== numericValue) {
      onChange(snappedValue);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(numericValue);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = e.clientY;
    const deltaY = startY - currentY;
    
    // Each 40px of movement changes by 5 minutes (matching visual row height)
    const steps = Math.round(deltaY / 40);
    const newValue = Math.max(0, Math.min(120, startValue + (steps * 5)));
    
    if (newValue !== numericValue) {
      onChange(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, startValue]);

  return (
    <div className="bg-gray-100 rounded-xl p-4 mb-3">
      {/* Selected time display */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-gray-800">
          {numericValue} мин
        </span>
      </div>

      {/* Vertical time picker */}
      <div 
        ref={containerRef}
        className="relative h-32 overflow-hidden bg-white rounded-lg shadow-inner"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none' // Prevent default touch behavior
        }}
      >
        {/* Highlight bar */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-10 bg-blue-50 border-t-2 border-b-2 border-blue-200 z-10 pointer-events-none" />
        
        {/* Time values */}
        <div 
          className="flex flex-col items-center justify-center h-full transition-transform duration-200"
          style={{
            transform: `translateY(${(12 - validIndex) * 40}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {timeValues.map((time, index) => (
            <div
              key={time}
              className={`h-10 flex items-center justify-center text-lg font-medium transition-all duration-200 ${
                index === validIndex 
                  ? 'text-blue-600 scale-110' 
                  : Math.abs(index - validIndex) === 1
                    ? 'text-gray-600 scale-100'
                    : 'text-gray-400 scale-90'
              }`}
              style={{
                opacity: Math.max(0.3, 1 - Math.abs(index - validIndex) * 0.3)
              }}
            >
              {time} мин
            </div>
          ))}
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          Сбросить
        </button>
        <button
          type="button"
          onClick={() => onChange(15)}
          className="flex-1 p-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
        >
          15 мин
        </button>
        <button
          type="button"
          onClick={() => onChange(30)}
          className="flex-1 p-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
        >
          30 мин
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-3">
        <p className="text-xs text-gray-500">
          Свайпайте вверх/вниз для изменения времени
        </p>
      </div>
    </div>
  );
};

export default VerticalTimePicker;