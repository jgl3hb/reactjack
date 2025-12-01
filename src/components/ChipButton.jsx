import React from 'react';

/**
 * Reusable casino chip button component
 */
const ChipButton = ({ value, onClick, disabled = false }) => {
  // Determine chip color based on value
  const getChipColor = (val) => {
    switch (val) {
      case 1:
        return { bg: 'bg-red-500', hover: 'hover:bg-red-600' };
      case 5:
        return { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' };
      case 25:
        return { bg: 'bg-green-500', hover: 'hover:bg-green-600' };
      case 100:
        return { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' };
      case 500:
        return { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' };
      default:
        return { bg: 'bg-gray-500', hover: 'hover:bg-gray-600' };
    }
  };

  const colors = getChipColor(value);

  return (
    <button
      className={`relative ${colors.bg} ${!disabled && colors.hover} text-white font-bold rounded-full w-16 h-16 transition-all duration-200 transform ${!disabled && 'hover:scale-110 active:scale-95'} ${disabled && 'opacity-50 cursor-not-allowed'} shadow-lg`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10 text-sm font-bold">${value}</span>
      {/* Inner white circle for chip design */}
      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-2 border-current opacity-30" style={{ width: '70%', height: '70%' }}></span>
    </button>
  );
};

export default ChipButton;
