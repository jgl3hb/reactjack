// Game Configuration Constants

// Starting bank amount
export const STARTING_BANK = 500;

// Available bet denominations
export const BET_DENOMINATIONS = [1, 5, 25, 100, 500];

// Payout multipliers
export const PAYOUTS = {
  BLACKJACK: 2.5,  // 3:2 payout (original bet + 1.5x profit = 2.5x total)
  WIN: 2,          // 1:1 payout (original bet + 1x profit = 2x total)
  PUSH: 1,         // Return original bet
  LOSS: 0          // Lose bet
};

// Deck configuration
export const DECK_CONFIG = {
  NUM_DECKS: 6,
  RESHUFFLE_THRESHOLD: 20  // Reshuffle when fewer than this many cards remain
};

// Dealer rules
export const DEALER_RULES = {
  STAND_VALUE: 17,  // Dealer must stand on 17 or higher
  HIT_VALUE: 16     // Dealer must hit on 16 or lower
};

// Game states
export const GAME_STATES = {
  BETTING: 'BETTING',
  DEALING: 'DEALING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  GAME_OVER: 'GAME_OVER'
};

// Card deck data - one complete deck
export const SINGLE_DECK = [
  "dA", "dQ", "dK", "dJ", "d10", "d09", "d08", "d07", "d06", "d05", "d04", "d03", "d02",
  "hA", "hQ", "hK", "hJ", "h10", "h09", "h08", "h07", "h06", "h05", "h04", "h03", "h02",
  "cA", "cQ", "cK", "cJ", "c10", "c09", "c08", "c07", "c06", "c05", "c04", "c03", "c02",
  "sA", "sQ", "sK", "sJ", "s10", "s09", "s08", "s07", "s06", "s05", "s04", "s03", "s02"
];

// Card values
export const CARD_VALUES = {
  'A': 11,
  'K': 10,
  'Q': 10,
  'J': 10,
  '10': 10,
  '09': 9,
  '08': 8,
  '07': 7,
  '06': 6,
  '05': 5,
  '04': 4,
  '03': 3,
  '02': 2
};
