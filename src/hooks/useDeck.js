import { useState, useCallback, useRef } from 'react';
import { SINGLE_DECK, DECK_CONFIG } from '../utils/gameConstants';

/**
 * Fisher-Yates shuffle algorithm
 */
const shuffleDeck = (deckToShuffle) => {
  const shuffled = [...deckToShuffle];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Creates a shuffled deck with the specified number of decks
 */
const createShuffledDeck = (numDecks) => {
  const multiDeck = [];
  for (let i = 0; i < numDecks; i++) {
    multiDeck.push(...SINGLE_DECK);
  }
  return shuffleDeck(multiDeck);
};

/**
 * Custom hook for managing a multi-deck shoe with automatic reshuffling
 */
export const useDeck = (numDecks = DECK_CONFIG.NUM_DECKS) => {
  const [deck, setDeck] = useState(() => createShuffledDeck(numDecks));
  const deckRef = useRef(deck);

  /**
   * Draws a card from the deck, reshuffles if needed
   * FIXED: Uses setState callback to capture drawn card properly
   */
  const drawCard = useCallback(() => {
    let currentDeck = deckRef.current;

    if (currentDeck.length <= DECK_CONFIG.RESHUFFLE_THRESHOLD) {
      currentDeck = createShuffledDeck(numDecks);
    }

    const drawnCard = currentDeck[0] || null;
    const nextDeck = currentDeck.slice(1);

    deckRef.current = nextDeck;
    setDeck(nextDeck);

    return drawnCard;
  }, [numDecks]);

  /**
   * Resets the deck to a fresh shuffled state
   */
  const resetDeck = useCallback(() => {
    const freshDeck = createShuffledDeck(numDecks);
    deckRef.current = freshDeck;
    setDeck(freshDeck);
  }, [numDecks]);

  return {
    deck,
    drawCard,
    resetDeck,
    cardsRemaining: deck.length
  };
};
