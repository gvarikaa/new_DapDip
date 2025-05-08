import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Pink
  '#000000', // Black
  '#8E8E93', // Gray
  '#FFFFFF', // White
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
  showHexInput?: boolean;
  presetColors?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  className,
  showHexInput = true,
  presetColors = DEFAULT_COLORS,
}) => {
  const [currentColor, setCurrentColor] = useState(color || '#000000');
  const [inputValue, setInputValue] = useState(color || '#000000');

  useEffect(() => {
    setCurrentColor(color);
    setInputValue(color);
  }, [color]);

  const handlePresetClick = (presetColor: string) => {
    setCurrentColor(presetColor);
    setInputValue(presetColor);
    onChange(presetColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only update if valid color
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(newValue)) {
      setCurrentColor(newValue);
      onChange(newValue);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    setInputValue(newColor);
    onChange(newColor);
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Current color display */}
      <div className="w-full h-8 rounded-md relative overflow-hidden" style={{ backgroundColor: currentColor }}>
        {/* Checkerboard pattern for transparency */}
        {currentColor.toLowerCase().endsWith('00') && (
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-full h-full",
                  (i + Math.floor(i / 8)) % 2 === 0 ? "bg-gray-200" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Color presets */}
      <div className="grid grid-cols-5 gap-2">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            className={cn(
              "w-full aspect-square rounded-md border border-border",
              "hover:scale-110 transition-transform",
              presetColor.toLowerCase() === currentColor.toLowerCase() && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: presetColor }}
            onClick={() => handlePresetClick(presetColor)}
            type="button"
          >
            <span className="sr-only">Select color {presetColor}</span>
          </button>
        ))}
      </div>
      
      {/* Custom color picker */}
      <input
        type="color"
        value={currentColor}
        onChange={handleCustomColorChange}
        className="w-full h-10 rounded-md cursor-pointer"
      />
      
      {/* Hex input */}
      {showHexInput && (
        <div className="flex items-center">
          <label className="text-xs text-muted-foreground w-8">#</label>
          <input
            type="text"
            value={inputValue.replace('#', '')}
            onChange={handleInputChange}
            className="flex-1 px-2 py-1 rounded-md border border-border bg-transparent text-sm"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;