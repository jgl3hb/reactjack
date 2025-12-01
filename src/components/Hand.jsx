import React from 'react';

/**
 * Card component with animation support and fanned layout
 */
const Card = ({ card, isHidden = false, className = '', index = 0, totalCards = 1 }) => {
  const cardClass = isHidden ? 'back-red' : card;

  // Calculate rotation and translation for fan effect
  const fanSpread = 15; // degrees of spread
  const cardSpacing = 30; // pixels between cards
  const maxRotation = (totalCards - 1) * fanSpread / 2;
  const rotation = (index * fanSpread) - maxRotation;
  const translateX = index * cardSpacing - ((totalCards - 1) * cardSpacing / 2);

  // Vertical curve - cards in middle are slightly higher
  const curveHeight = 10;
  const distanceFromCenter = Math.abs(index - (totalCards - 1) / 2);
  const maxDistance = (totalCards - 1) / 2;
  const translateY = distanceFromCenter / maxDistance * curveHeight;

  const transform = totalCards > 1
    ? `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`
    : 'none';

  return (
    <div
      className={`card large ${cardClass} ${className} transition-all duration-300 hover:scale-110 hover:z-50`}
      style={{
        transform,
        transformOrigin: 'bottom center',
        position: totalCards > 1 ? 'absolute' : 'relative',
        zIndex: index
      }}
    />
  );
};

/**
 * Hand display component with fanned card layout
 */
const Hand = ({
  cards,
  showAllCards = true,
  label = '',
  showValue = false,
  value = 0,
  alwaysShowValue = false // New prop to always show value
}) => {
  const totalCards = cards.length;

  // Calculate container width based on card count for fan layout
  const containerWidth = totalCards > 1 ? totalCards * 30 + 100 : 120;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <div className="text-white text-xl font-bold">{label}</div>
      )}

      {/* Card container with relative positioning for fanning */}
      <div
        className="flex justify-center items-center"
        style={{
          position: 'relative',
          minHeight: '160px',
          width: `${containerWidth}px`
        }}
      >
        {cards.map((card, i) => (
          <Card
            key={i}
            card={card}
            isHidden={!showAllCards && i === 1}
            className="shadow-xl"
            index={i}
            totalCards={totalCards}
          />
        ))}
      </div>

      {/* Show value if requested or always show */}
      {(showValue || alwaysShowValue) && cards.length > 0 && (
        <div className="text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          {value}
        </div>
      )}
    </div>
  );
};

export default Hand;
export { Card };
