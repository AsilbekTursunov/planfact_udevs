import React from 'react'

const CustomProgress = ({ 
  value = 0, 
  min = 0, 
  max = 100, 
  className = "", 
  trackColor = "#F2F4F7", // Default light gray
  fillColor = "#F79009",  // Default amber/orange
  height = "8px",
  style = {}
}) => {
  const range = max - min;
  const percentage = range === 0 
    ? (value > min ? 100 : 0)
    : Math.min(Math.max(((value - min) / range) * 100, 0), 100);

  const isTailwindTrack = typeof trackColor === 'string' && trackColor.startsWith('bg-');
  const isTailwindFill = typeof fillColor === 'string' && fillColor.startsWith('bg-');

  return (
    <div 
      className={`w-full rounded-full overflow-hidden ${isTailwindTrack ? trackColor : ''} ${className}`}
      style={{ 
        height, 
        backgroundColor: isTailwindTrack ? undefined : trackColor,
        ...style 
      }}
    >
      <div 
        className={`${isTailwindFill ? fillColor : ''} h-full transition-all duration-300 rounded-full`}
        style={{ 
          width: `${percentage}%`,
          backgroundColor: isTailwindFill ? undefined : fillColor
        }}
      />
    </div>
  )
}

export default CustomProgress