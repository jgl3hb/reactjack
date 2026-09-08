import React, { useEffect } from 'react';

/**
 * Game control buttons (Hit, Stand, Double Down, Split, Deal, New Round, Reset)
 */
const GameControls = ({
  onHit,
  onStand,
  onDoubleDown,
  onSplit,
  onDeal,
  onReset,
  onNewRound,
  canHit = false,
  canStand = false,
  canDouble = false,
  canSplit = false,
  canDeal = false,
  canSurrender = false,
  onSurrender,
  insuranceOffered = false,
  insuranceCost = 0,
  canAffordInsurance = true,
  onTakeInsurance,
  onDeclineInsurance,
  gameOver = false,
  activeSeatName = null,
  isPlayerTurn = false,
  isDealerTurn = false
}) => {
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keystrokes when typing inside inputs or modals
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (insuranceOffered) {
        if ((key === 'y' || key === 'i') && canAffordInsurance && onTakeInsurance) {
          e.preventDefault();
          onTakeInsurance();
        } else if ((key === 'n') && onDeclineInsurance) {
          e.preventDefault();
          onDeclineInsurance();
        }
        return;
      }

      if ((key === 's') && canStand && !gameOver) {
        e.preventDefault();
        onStand();
      } else if ((key === 'h') && canHit && !gameOver) {
        e.preventDefault();
        onHit();
      } else if ((key === 'd') && canDouble && !gameOver) {
        e.preventDefault();
        if (onDoubleDown) onDoubleDown();
      } else if ((key === 'p') && canSplit && !gameOver) {
        e.preventDefault();
        if (onSplit) onSplit();
      } else if ((key === 'u') && canSurrender && !gameOver) {
        e.preventDefault();
        if (onSurrender) onSurrender();
      } else if (key === ' ' || key === 'enter') {
        if (canDeal) {
          e.preventDefault();
          onDeal();
        } else if (gameOver && onNewRound) {
          e.preventDefault();
          onNewRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canStand,
    canHit,
    canDouble,
    canSplit,
    canDeal,
    canSurrender,
    insuranceOffered,
    insuranceCost,
    canAffordInsurance,
    gameOver,
    onStand,
    onHit,
    onDoubleDown,
    onSplit,
    onDeal,
    onNewRound,
    onSurrender,
    onTakeInsurance,
    onDeclineInsurance
  ]);

  const baseBtnClass = "px-4 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-lg rounded-xl font-bold transition-all duration-200 transform shadow-xl w-full sm:w-auto flex items-center justify-center gap-2 select-none";

  return (
    <div className="flex flex-col items-center w-full px-2">
      {/* Turn Activity Indicator */}
      {!gameOver && !canDeal && (
        <div className="mb-2 text-xs sm:text-sm font-semibold text-center">
          {insuranceOffered ? (
            <span className="text-cyan-300 animate-pulse bg-black bg-opacity-50 px-4 py-1.5 rounded-full border border-cyan-500 border-opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              Dealer shows Ace! Decide Insurance (Cost: ${insuranceCost})
            </span>
          ) : isDealerTurn ? (
            <span className="text-yellow-300 animate-pulse bg-black bg-opacity-40 px-3 py-1 rounded-full border border-yellow-500 border-opacity-30">
              Dealer is playing out hand...
            </span>
          ) : isPlayerTurn ? (
            <span className="text-green-300 bg-black bg-opacity-40 px-3 py-1 rounded-full border border-green-500 border-opacity-40 shadow-[0_0_12px_rgba(34,197,94,0.3)]">
              Your Turn! Choose Hit or Stand
            </span>
          ) : activeSeatName ? (
            <span className="text-gray-300 bg-black bg-opacity-40 px-3 py-1 rounded-full border border-gray-600">
              Waiting for <strong className="text-yellow-400">{activeSeatName}</strong> to act...
            </span>
          ) : null}
        </div>
      )}

      {/* Action Button Bar */}
      {insuranceOffered ? (
        <div className="flex flex-wrap gap-2.5 sm:gap-3.5 justify-center w-full max-w-xl">
          <button
            className={`${baseBtnClass} ${
              canAffordInsurance
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white hover:scale-105 active:scale-95 ring-2 ring-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.6)]'
                : 'bg-gray-800 text-gray-500 opacity-40 cursor-not-allowed'
            }`}
            onClick={onTakeInsurance}
            disabled={!canAffordInsurance}
          >
            <span>Take Insurance (${insuranceCost})</span>
            {canAffordInsurance && (
              <span className="text-[10px] bg-black bg-opacity-40 px-1.5 py-0.5 rounded text-cyan-200 uppercase font-mono">Y</span>
            )}
          </button>
          <button
            className={`${baseBtnClass} bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 active:scale-95 ring-1 ring-gray-400 shadow-md`}
            onClick={onDeclineInsurance}
          >
            <span>No Insurance</span>
            <span className="text-[10px] bg-black bg-opacity-40 px-1.5 py-0.5 rounded text-gray-300 uppercase font-mono">N</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 sm:gap-3.5 justify-center w-full max-w-3xl">
          {/* Deal or New Round Button */}
          {gameOver && onNewRound ? (
            <button
              className={`${baseBtnClass} bg-green-600 hover:bg-green-500 text-white font-extrabold hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.5)] ring-2 ring-green-400`}
              onClick={onNewRound}
            >
              <span>New Round</span>
              <span className="text-[10px] bg-black bg-opacity-30 px-1.5 py-0.5 rounded text-green-200 uppercase font-mono">Space</span>
            </button>
          ) : (
            <button
              className={`${baseBtnClass} ${
                canDeal
                  ? 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 active:scale-95 shadow-[0_0_16px_rgba(34,197,94,0.4)]'
                  : 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              onClick={onDeal}
              disabled={!canDeal}
            >
              <span>Deal</span>
              {canDeal && (
                <span className="text-[10px] bg-black bg-opacity-30 px-1.5 py-0.5 rounded text-green-200 uppercase font-mono">Space</span>
              )}
            </button>
          )}

          {/* Hit Button */}
          <button
            className={`${baseBtnClass} ${
              canHit && !gameOver
                ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95 hit-btn-active ring-2 ring-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.6)]'
                : 'bg-gray-800 text-gray-500 opacity-40 cursor-not-allowed'
            }`}
            onClick={onHit}
            disabled={!canHit || gameOver}
          >
            <span>Hit</span>
            {canHit && !gameOver && (
              <span className="text-[10px] bg-blue-900 bg-opacity-80 px-1.5 py-0.5 rounded text-blue-200 uppercase font-mono">H</span>
            )}
          </button>

          {/* Stand Button with vivid glowing active state */}
          <button
            className={`${baseBtnClass} ${
              canStand && !gameOver
                ? 'bg-orange-500 hover:bg-orange-400 text-white font-extrabold hover:scale-105 active:scale-95 stand-btn-active ring-4 ring-orange-300 ring-opacity-90 shadow-[0_0_25px_rgba(249,115,22,0.85)]'
                : 'bg-gray-800 text-gray-500 opacity-40 cursor-not-allowed'
            }`}
            onClick={onStand}
            disabled={!canStand || gameOver}
          >
            <span>Stand</span>
            {canStand && !gameOver && (
              <span className="text-[10px] bg-black bg-opacity-40 px-1.5 py-0.5 rounded text-orange-200 uppercase font-mono">S</span>
            )}
          </button>

          {/* Double Down Button */}
          {canDouble && !gameOver && (
            <button
              className={`${baseBtnClass} bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 active:scale-95 ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]`}
              onClick={onDoubleDown}
              disabled={!canDouble || gameOver}
            >
              <span>Double Down</span>
              <span className="text-[10px] bg-black bg-opacity-30 px-1.5 py-0.5 rounded text-purple-200 uppercase font-mono">D</span>
            </button>
          )}

          {/* Split Button */}
          {canSplit && !gameOver && (
            <button
              className={`${baseBtnClass} bg-pink-600 hover:bg-pink-500 text-white hover:scale-105 active:scale-95 ring-2 ring-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]`}
              onClick={onSplit}
              disabled={!canSplit || gameOver}
            >
              <span>Split</span>
              <span className="text-[10px] bg-black bg-opacity-30 px-1.5 py-0.5 rounded text-pink-200 uppercase font-mono">P</span>
            </button>
          )}

          {/* Surrender Button */}
          {canSurrender && !gameOver && (
            <button
              className={`${baseBtnClass} bg-amber-700 hover:bg-amber-600 text-white hover:scale-105 active:scale-95 ring-1 ring-amber-400 shadow-md`}
              onClick={onSurrender}
            >
              <span>Surrender</span>
              <span className="text-[10px] bg-black bg-opacity-30 px-1.5 py-0.5 rounded text-amber-200 uppercase font-mono">U</span>
            </button>
          )}

          {/* Reset Button */}
          <button
            className={`${baseBtnClass} bg-gray-800 hover:bg-red-700 text-gray-300 hover:text-white border border-white border-opacity-10 hover:scale-105 active:scale-95`}
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default GameControls;

