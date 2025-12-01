import React from 'react';

/**
 * Card component with animation support
 */
const Card = ({ card, isHidden = false, className = '' }) => {
  const cardClass = isHidden ? 'back-red' : card;

  return (
    <div
      className={`card large ${cardClass} ${className} transition-all duration-300 hover:scale-105`}
    />
  );
};

/**
 * Hand display component
 */
const Hand = ({ cards, showAllCards = true, label = '', showValue = false, value = 0 }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <div className="text-white text-xl font-bold">{label}</div>
      )}
      <div className="flex justify-center gap-2 flex-wrap">
        {cards.map((card, i) => (
          <Card
            key={i}
            card={card}
            isHidden={!showAllCards && i === 1}
            className="shadow-xl"
          />
        ))}
      </div>
      {showValue && (
        <div className="text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          {value}
        </div>
      )}
    </div>
  );
};

export default Hand;
export { Card };
