import { useState, useCallback } from 'react';
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

  /**
   * Draws a card from the deck, reshuffles if needed
   * FIXED: Uses setState callback to capture drawn card properly
   */
  const drawCard = useCallback(() => {
    let drawnCard = null;

    setDeck(currentDeck => {
      let deckToDrawFrom = [...currentDeck];
      // Check if we need to reshuffle BEFORE drawing
      if (deckToDrawFrom.length <= DECK_CONFIG.RESHUFFLE_THRESHOLD) {
        console.log('Reshuffling deck...');
        deckToDrawFrom = createShuffledDeck(numDecks);
      }

      // Draw from the determined deck
      drawnCard = deckToDrawFrom[0];
      return deckToDrawFrom.slice(1); // Update state with the sliced deck
    });

    return drawnCard;
  }, [numDecks]);

  /**
   * Resets the deck to a fresh shuffled state
   */
  const resetDeck = useCallback(() => {
    setDeck(createShuffledDeck(numDecks));
  }, [numDecks]);

  return {
    deck,
    drawCard,
    resetDeck,
    cardsRemaining: deck.length
  };
};
