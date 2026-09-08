// Card Counting (Hi-Lo System) utilities and Chuck's mentor analysis

import { getCardRank } from '../hooks/useBlackjackGame';

/**
 * Hi-Lo card values:
 * 2, 3, 4, 5, 6: +1 (Low cards favor player when depleted)
 * 7, 8, 9: 0 (Neutral cards)
 * 10, J, Q, K, A: -1 (High cards favor dealer when depleted, favor player when in shoe)
 */
export const getHiLoValue = (card) => {
  if (!card) return 0;
  const rank = getCardRank(card);
  if (['02', '03', '04', '05', '06'].includes(rank)) return 1;
  if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1;
  return 0;
};

export const getHiLoBadgeInfo = (card) => {
  const value = getHiLoValue(card);
  if (value === 1) {
    return { text: '+1', colorClass: 'bg-green-600 text-white border-green-400' };
  }
  if (value === -1) {
    return { text: '-1', colorClass: 'bg-red-600 text-white border-red-400' };
  }
  return { text: '0', colorClass: 'bg-gray-600 text-gray-200 border-gray-400' };
};

export const calculateTrueCount = (runningCount, cardsRemaining) => {
  const decksRemaining = Math.max(cardsRemaining / 52, 0.25);
  return Number((runningCount / decksRemaining).toFixed(2));
};

export const getShoeAdvantageLevel = (trueCount) => {
  if (trueCount >= 3.0) return { level: 'Extremely Favorable', color: 'text-emerald-400', multiplier: 4 };
  if (trueCount >= 2.0) return { level: 'Favorable', color: 'text-green-400', multiplier: 3 };
  if (trueCount >= 1.0) return { level: 'Slight Advantage', color: 'text-cyan-400', multiplier: 2 };
  if (trueCount <= -2.0) return { level: 'Heavy House Edge', color: 'text-rose-400', multiplier: 1 };
  if (trueCount <= -1.0) return { level: 'Unfavorable', color: 'text-orange-400', multiplier: 1 };
  return { level: 'Neutral Shoe', color: 'text-gray-300', multiplier: 1 };
};

/**
 * Chuck's contextual counting mentor feedback
 */
export const getChuckMentorAdvice = ({ runningCount, trueCount, cardsRemaining }) => {
  const decksRemaining = (cardsRemaining / 52).toFixed(1);

  if (trueCount >= 3.0) {
    return `True Count is +${trueCount} with ${decksRemaining} decks remaining. The shoe is heavily saturated with 10-value cards and Aces. This is prime card-counter territory: Blackjacks pay 3:2, and doubles have high conversion rates. Bet aggressively!`;
  }
  if (trueCount >= 1.5) {
    return `True Count is +${trueCount}. The low cards (2 through 6) have been drained, giving players a measurable edge. The dealer is more likely to bust on stiff hands (12 through 16). Time to press your bet above minimum.`;
  }
  if (trueCount <= -2.0) {
    return `True Count is ${trueCount}. The remaining shoe is depleted of Aces and 10s. You will see fewer natural Blackjacks and dealer stiff hands are likely to draw small cards to safety. Keep your wagers strictly at the table minimum.`;
  }
  return `True Count is ${trueCount} (Running count: ${runningCount}, Decks left: ${decksRemaining}). The distribution of high and low cards remains balanced. Stick to standard basic strategy bet sizing.`;
};

export const HI_LO_SYSTEM_GUIDE = {
  title: 'Hi-Lo Card Counting System',
  principles: [
    {
      group: 'Low Cards (2 - 6)',
      value: '+1',
      tag: 'Player Advantage when dealt out',
      detail: 'When small cards leave the deck, the remaining shoe becomes richer in tens and aces, increasing player natural blackjacks and dealer busts.'
    },
    {
      group: 'Neutral Cards (7 - 9)',
      value: '0',
      tag: 'Negligible impact',
      detail: 'These cards have minimal effect on the balance between high and low cards and do not change the count.'
    },
    {
      group: 'High Cards (10, J, Q, K, A)',
      value: '-1',
      tag: 'House Advantage when dealt out',
      detail: 'Tens and Aces favor the player. When they appear on the felt, they leave the shoe poorer in big cards, shifting the advantage back toward the casino.'
    }
  ],
  trueCountExplanation: 'Running count only tells part of the story. 4 extra tens in 1 deck (+4 True Count) is massive, whereas 4 extra tens across 6 decks (+0.67 True Count) is tiny. Always divide Running Count by the estimated number of decks remaining to calculate True Count.'
};
