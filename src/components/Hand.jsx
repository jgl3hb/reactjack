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
  showCountTag = false
}) => {
  const cardClass = isHidden ? 'back-red' : card;
  const badgeInfo = !isHidden ? getHiLoBadgeInfo(card) : null;

  // Calculate rotation and translation for fan effect
  const fanSpread = 15; // degrees of spread
  const maxRotation = ((totalCards - 1) * fanSpread) / 2;
  const rotation = index * fanSpread - maxRotation;

  // Vertical curve - cards in middle are slightly higher
  const curveHeight = 10;
  const distanceFromCenter = Math.abs(index - (totalCards - 1) / 2);
  const maxDistance = (totalCards - 1) / 2;
  const translateY = maxDistance === 0 ? 0 : (distanceFromCenter / maxDistance) * curveHeight;

  const transform = totalCards > 1
    ? `translateY(${translateY}px) rotate(${rotation}deg)`
    : 'none';

  return (
    <div
      className={`card ${cardClass} ${className} w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-40 xl:w-32 xl:h-44 relative bg-white rounded-lg border border-gray-300 transition-all duration-300 hover:-translate-y-4 hover:scale-110 hover:z-50 shadow-md`}
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
          className={`absolute top-1 right-1 text-[10px] sm:text-xs font-black px-1 sm:px-1.5 py-0.5 rounded border shadow-md pointer-events-none select-none ${badgeInfo.colorClass}`}
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
  showCountTags = false
}) => {
  const totalCards = cards.length;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {label && (
        <div className="text-white text-md sm:text-lg lg:text-xl font-bold mb-1 truncate px-2">{label}</div>
      )}

      {/* Card container with flex and negative margins for overlapping */}
      <div className="flex justify-center items-center flex-row min-h-[120px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[220px]">
        {cards.map((card, i) => (
          <div key={i} className={i > 0 ? "-ml-6 sm:-ml-10 md:-ml-14" : ""}>
            <Card
              card={card}
              isHidden={!showAllCards && i === 1}
              className="shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              index={i}
              totalCards={totalCards}
              showCountTag={showCountTags}
            />
          </div>
        ))}
      </div>

      {/* Show value if requested or always show */}
      {(showValue || alwaysShowValue) && cards.length > 0 && (
        <div className="text-white text-2xl sm:text-3xl font-bold bg-green-900/60 px-4 sm:px-5 py-1.5 sm:py-2 mt-2 rounded-xl border border-green-700/50 shadow-md">
          {value}
        </div>
      )}
    </div>
  );
};

export default Hand;
export { Card };
