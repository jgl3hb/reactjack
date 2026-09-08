import React from 'react';

/**
 * Animated speech bubble for character dialogue at the Blackjack table
 */
export const SpeechBubble = ({ text, characterId, className = '' }) => {
  if (!text) return null;

  let borderColor = 'border-yellow-400';

  if (characterId === 'alice') {
    borderColor = 'border-indigo-400';
  } else if (characterId === 'bob') {
    borderColor = 'border-rose-400';
  } else if (characterId === 'chuck') {
    borderColor = 'border-emerald-400';
  } else if (characterId === 'jimbob') {
    borderColor = 'border-amber-400';
  }

  return (
    <div
      className={`absolute -top-20 left-1/2 -translate-x-1/2 z-30 w-48 sm:w-56 pointer-events-none transition-all duration-300 animate-speech-pop ${className}`}
    >
      <div
        className={`relative bg-gray-900/95 text-white text-xs sm:text-sm px-3 py-2 rounded-xl border-2 ${borderColor} shadow-2xl backdrop-blur-md text-center`}
      >
        <p className="leading-snug font-medium italic select-none">"{text}"</p>
        {/* Pointer arrow pointing down */}
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${borderColor.replace('border-', 'border-t-')}`}
        />
      </div>
    </div>
  );
};

export default SpeechBubble;
