import React from 'react';

/**
 * Game control buttons (Hit, Stand, Double Down, etc.)
 */
const GameControls = ({
  onHit,
  onStand,
  onDoubleDown,
  onDeal,
  onReset,
  canHit = false,
  canStand = false,
  canDouble = false,
  canDeal = false,
  gameOver = false
}) => {
  const buttonClass = "px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg";

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* Deal Button */}
      <button
        className={`${buttonClass} bg-green-600 hover:bg-green-700`}
        onClick={onDeal}
        disabled={!canDeal}
      >
        Deal
      </button>

      {/* Hit Button */}
      <button
        className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
        onClick={onHit}
        disabled={!canHit || gameOver}
      >
        Hit
      </button>

      {/* Stand Button */}
      <button
        className={`${buttonClass} bg-orange-600 hover:bg-orange-700`}
        onClick={onStand}
        disabled={!canStand || gameOver}
      >
        Stand
      </button>

      {/* Double Down Button */}
      {canDouble && (
        <button
          className={`${buttonClass} bg-purple-600 hover:bg-purple-700`}
          onClick={onDoubleDown}
          disabled={!canDouble || gameOver}
        >
          Double Down
        </button>
      )}

      {/* Reset Button */}
      <button
        className={`${buttonClass} bg-red-600 hover:bg-red-700`}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
};

export default GameControls;
