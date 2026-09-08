import { CARD_VALUES, PAYOUTS, DEALER_RULES } from '../utils/gameConstants';

/**
 * Gets the numeric value of a card
 * @param {string} card - Card code like 'dA', 's10', etc.
 * @returns {number} The card's value
 */
export const getCardValue = (card) => {
  if (!card || typeof card !== 'string') return 0;
  const cardRank = card.slice(1); // Remove suit (first character)
  return CARD_VALUES[cardRank] || 0;
};

/**
 * Gets the rank of a card (for split detection)
 * @param {string} card - Card code like 'dA', 's10', etc.
 * @returns {string} The card's rank
 */
export const getCardRank = (card) => {
  if (!card || typeof card !== 'string') return '';
  return card.slice(1);
};

/**
 * Calculates hand total with proper Ace handling
 * Aces are counted as 11 initially, then reduced to 1 if hand would bust
 * @param {Array<string>} hand - Array of card codes
 * @returns {number} The hand's total value
 */
export const calculateHandValue = (hand) => {
  if (!hand || hand.length === 0) return 0;

  let total = 0;
  let aces = 0;

  // First pass: count total and aces
  hand.forEach(card => {
    const value = getCardValue(card);
    total += value;
    if (getCardRank(card) === 'A') {
      aces++;
    }
  });

  // Second pass: adjust aces from 11 to 1 if needed to avoid bust
  while (total > 21 && aces > 0) {
    total -= 10; // Convert an ace from 11 to 1
    aces--;
  }

  return total;
};

/**
 * Returns true when hand is "soft" (contains at least one ace counted as 11)
 * @param {Array<string>} hand
 * @returns {boolean}
 */
export const isSoftHand = (hand) => {
  if (!hand || hand.length === 0) return false;

  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    total += getCardValue(card);
    if (getCardRank(card) === 'A') aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return aces > 0;
};

/**
 * Checks if a hand is a natural blackjack (Ace + 10-value card with exactly 2 cards)
 * FIXED: Now properly checks card codes instead of values
 * @param {Array<string>} hand - Array of card codes
 * @returns {boolean} True if hand is blackjack
 */
export const isBlackjack = (hand) => {
  if (!hand || hand.length !== 2) return false;

  const ranks = hand.map(card => getCardRank(card));
  const hasAce = ranks.some(rank => rank === 'A');
  const hasTen = ranks.some(rank => ['K', 'Q', 'J', '10'].includes(rank));

  return hasAce && hasTen;
};

/**
 * Checks if a hand can be split (two cards of same rank)
 * @param {Array<string>} hand - Array of card codes
 * @returns {boolean} True if hand can be split
 */
export const canSplit = (hand) => {
  if (!hand || hand.length !== 2) return false;

  const rank1 = getCardRank(hand[0]);
  const rank2 = getCardRank(hand[1]);

  return rank1 === rank2;
};

/**
 * Checks if double down is allowed (only on first two cards)
 * @param {Array<string>} hand - Array of card codes
 * @returns {boolean} True if can double down
 */
export const canDoubleDown = (hand) => {
  return hand && hand.length === 2;
};

/**
 * Determines if dealer should hit
 * FIXED: Dealer hits on 16 or less, stands on 17 or more
 * @param {number} dealerTotal - Dealer's hand value
 * @returns {boolean} True if dealer should hit
 */
export const shouldDealerHit = (dealerTotal, dealerHand = [], rules = {}) => {
  const dealerHitsSoft17 = rules.dealerHitsSoft17 ?? false;
  if (dealerTotal < DEALER_RULES.STAND_VALUE) return true;
  if (dealerHitsSoft17 && dealerTotal === DEALER_RULES.STAND_VALUE && isSoftHand(dealerHand)) {
    return true;
  }
  return false;
};

/**
 * Determines the winner and calculates payout
 * @param {number} playerTotal - Player's hand value
 * @param {number} dealerTotal - Dealer's hand value
 * @param {Array<string>} playerHand - Player's hand
 * @param {Array<string>} dealerHand - Dealer's hand
 * @param {number} bet - Current bet amount
 * @returns {Object} Result with status, message, and payout
 */
export const determineWinner = (
  playerTotal,
  dealerTotal,
  playerHand,
  dealerHand,
  bet,
  options = {}
) => {
  const playerBlackjack = options.playerNaturalBlackjack ?? isBlackjack(playerHand);
  const dealerBlackjack = options.dealerNaturalBlackjack ?? isBlackjack(dealerHand);
  const blackjackPayoutMultiplier = options.blackjackPayoutMultiplier ?? (PAYOUTS.BLACKJACK - 1);

  // Both have blackjack - push
  if (playerBlackjack && dealerBlackjack) {
    return {
      status: 'push',
      message: "Both have Blackjack! It's a Push.",
      payout: bet * PAYOUTS.PUSH
    };
  }

  // Player blackjack wins - pays 3:2
  if (playerBlackjack) {
    return {
      status: 'win',
      message: "Blackjack! You win 3:2!",
      payout: bet * (1 + blackjackPayoutMultiplier)
    };
  }

  // Dealer blackjack wins
  if (dealerBlackjack) {
    return {
      status: 'loss',
      message: "Dealer has Blackjack. You lose.",
      payout: bet * PAYOUTS.LOSS
    };
  }

  // Player busted
  if (playerTotal > 21) {
    return {
      status: 'loss',
      message: "Player Busts! Dealer wins.",
      payout: bet * PAYOUTS.LOSS
    };
  }

  // Dealer busted
  if (dealerTotal > 21) {
    return {
      status: 'win',
      message: "Dealer Busts! You win!",
      payout: bet * PAYOUTS.WIN
    };
  }

  // Compare totals
  if (playerTotal > dealerTotal) {
    return {
      status: 'win',
      message: "You win!",
      payout: bet * PAYOUTS.WIN
    };
  } else if (dealerTotal > playerTotal) {
    return {
      status: 'loss',
      message: "Dealer wins.",
      payout: bet * PAYOUTS.LOSS
    };
  } else {
    return {
      status: 'push',
      message: "It's a Push!",
      payout: bet * PAYOUTS.PUSH
    };
  }
};
