import React from 'react';
import { getHiLoBadgeInfo } from '../utils/cardCounting';

/**
 * Card component with animation support, fanned layout, and optional Hi-Lo count badge
 */
const Card = ({
  card,
  isHidden = false,
  className = '',
  index = 0,
  totalCards = 1,
  showCountTag = false,
  compact = false
}) => {
  const cardClass = isHidden ? 'back-red' : card;
  const badgeInfo = !isHidden ? getHiLoBadgeInfo(card) : null;

  // Calculate rotation and translation for fan effect
  const fanSpread = compact ? 10 : 14;
  const maxRotation = ((totalCards - 1) * fanSpread) / 2;
  const rotation = index * fanSpread - maxRotation;

  // Vertical curve - cards in middle are slightly higher
  const curveHeight = compact ? 6 : 10;
  const distanceFromCenter = Math.abs(index - (totalCards - 1) / 2);
  const maxDistance = (totalCards - 1) / 2;
  const translateY = maxDistance === 0 ? 0 : (distanceFromCenter / maxDistance) * curveHeight;

  const transform = totalCards > 1
    ? `translateY(${translateY}px) rotate(${rotation}deg)`
    : 'none';

  const sizeClasses = compact
    ? 'w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28'
    : 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-34 lg:w-28 lg:h-40';

  return (
    <div
      className={`card ${cardClass} ${className} ${sizeClasses} relative bg-white rounded-lg border border-gray-300 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:z-50 shadow-md`}
      style={{
        transform,
        transformOrigin: 'bottom center',
        zIndex: index,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {showCountTag && badgeInfo && (
        <div
          className={`absolute top-0.5 right-0.5 text-[9px] sm:text-[10px] font-black px-1 py-0.5 rounded border shadow-sm pointer-events-none select-none ${badgeInfo.colorClass}`}
        >
          {badgeInfo.text}
        </div>
      )}
    </div>
  );
};

/**
 * Hand display component with fanned card layout
 */
const Hand = ({
  cards = [],
  showAllCards = true,
  label = '',
  showValue = false,
  value = 0,
  alwaysShowValue = false,
  showCountTags = false,
  compact = false
}) => {
  const totalCards = cards.length;

  const containerHeight = compact
    ? 'min-h-[90px] sm:min-h-[105px] md:min-h-[120px]'
    : 'min-h-[120px] sm:min-h-[150px] md:min-h-[180px]';

  const overlapMargin = compact
    ? '-ml-8 sm:-ml-10 md:-ml-12'
    : '-ml-6 sm:-ml-10 md:-ml-14';

  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      {label && (
        <div className="text-white text-sm sm:text-base lg:text-lg font-bold mb-0.5 truncate px-2">{label}</div>
      )}

      {/* Card container with flex and negative margins for overlapping */}
      <div className={`flex justify-center items-center flex-row ${containerHeight}`}>
        {cards.map((card, i) => (
          <div key={i} className={i > 0 ? overlapMargin : ''}>
            <Card
              card={card}
              isHidden={!showAllCards && i === 1}
              className="shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              index={i}
              totalCards={totalCards}
              showCountTag={showCountTags}
              compact={compact}
            />
          </div>
        ))}
      </div>

      {/* Show value if requested or always show */}
      {(showValue || alwaysShowValue) && cards.length > 0 && (
        <div
          className={`text-white font-bold bg-green-900/70 px-3.5 py-1 mt-1 rounded-xl border border-green-700/50 shadow-md ${
            compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          {value}
        </div>
      )}
    </div>
  );
};

export default Hand;
export { Card };
