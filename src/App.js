import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import './cardstarter.css';
import { useDeck } from './hooks/useDeck';
import {
  calculateHandValue,
  isBlackjack,
  determineWinner,
  shouldDealerHit,
  canDoubleDown as checkCanDoubleDown
} from './hooks/useBlackjackGame';
import { STARTING_BANK, BET_DENOMINATIONS, GAME_STATES } from './utils/gameConstants';
import ChipButton from './components/ChipButton';
import GameControls from './components/GameControls';
import Hand from './components/Hand';

const Blackjack = () => {
  // Game state
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerBank, setPlayerBank] = useState(STARTING_BANK);
  const [currentBet, setCurrentBet] = useState(0);
  const [status, setStatus] = useState('Place your bet to begin!');
  const [gameState, setGameState] = useState(GAME_STATES.BETTING);
  const [showDealerCard, setShowDealerCard] = useState(false);

  // Deck management
  const { drawCard, resetDeck, cardsRemaining } = useDeck();

  // Calculate hand values
  const playerScore = calculateHandValue(playerHand);
  const dealerScore = calculateHandValue(dealerHand);

  /**
   * Handle placing a bet
   */
  const handleBet = useCallback((betAmount) => {
    if (gameState !== GAME_STATES.BETTING) {
      setStatus('Finish current game before placing new bet');
      return;
    }

    if (playerBank >= betAmount) {
      setPlayerHand([]);
      setDealerHand([]);
      setShowDealerCard(false);
      setStatus(`Bet placed: $${betAmount}. Click Deal to start!`);
      setCurrentBet(betAmount);
      setPlayerBank(prev => prev - betAmount);
      setGameState(GAME_STATES.DEALING);
    } else {
      setStatus(`Insufficient funds! You have $${playerBank}`);
    }
  }, [gameState, playerBank]);

  /**
   * Deal initial cards (2 to player, 2 to dealer)
   * FIXED: Proper blackjack detection and payout
   */
  const initialDeal = useCallback(() => {
    if (gameState !== GAME_STATES.DEALING) {
      return;
    }

    // Deal 2 cards to each
    const newPlayerHand = [drawCard(), drawCard()];
    const newDealerHand = [drawCard(), drawCard()];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);

    // Check for blackjacks
    const playerBJ = isBlackjack(newPlayerHand);
    const dealerBJ = isBlackjack(newDealerHand);

    if (playerBJ || dealerBJ) {
      // Show dealer's cards
      setShowDealerCard(true);

      const result = determineWinner(
        calculateHandValue(newPlayerHand),
        calculateHandValue(newDealerHand),
        newPlayerHand,
        newDealerHand,
        currentBet
      );

      setStatus(result.message);
      setPlayerBank(prev => prev + result.payout);
      setGameState(GAME_STATES.GAME_OVER);
    } else {
      setStatus('Hit or Stand?');
      setGameState(GAME_STATES.PLAYER_TURN);
    }
  }, [gameState, drawCard, currentBet]);

  /**
   * Player hits (draws a card)
   * FIXED: Proper state management and bust detection
   */
  const hit = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;

    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);

    const newScore = calculateHandValue(newHand);

    if (newScore > 21) {
      // Player busted
      setShowDealerCard(true);
      setStatus("Player Busts! Dealer wins.");
      setGameState(GAME_STATES.GAME_OVER);
    } else if (newScore === 21) {
      // Auto-stand on 21
      stand(newHand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, playerHand, drawCard]);

  /**
   * Player stands (dealer's turn)
   * FIXED: Dealer now correctly stands on 17, not hits
   */
  const stand = useCallback((handToUse = null) => {
    const currentPlayerHand = handToUse || playerHand;

    if (gameState !== GAME_STATES.PLAYER_TURN) return;

    setGameState(GAME_STATES.DEALER_TURN);
    setShowDealerCard(true);

    // Dealer draws cards
    let newDealerHand = [...dealerHand];
    let dealerValue = calculateHandValue(newDealerHand);

    // FIXED: Dealer hits on < 17, stands on >= 17
    while (shouldDealerHit(dealerValue)) {
      newDealerHand.push(drawCard());
      dealerValue = calculateHandValue(newDealerHand);
    }

    setDealerHand(newDealerHand);

    // Determine winner
    const result = determineWinner(
      calculateHandValue(currentPlayerHand),
      dealerValue,
      currentPlayerHand,
      newDealerHand,
      currentBet
    );

    setStatus(result.message);
    setPlayerBank(prev => prev + result.payout);
    setGameState(GAME_STATES.GAME_OVER);
  }, [gameState, playerHand, dealerHand, drawCard, currentBet]);

  /**
   * Double down - double bet, take one card, then stand
   */
  const doubleDown = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;
    if (!checkCanDoubleDown(playerHand)) return;
    if (playerBank < currentBet) {
      setStatus('Insufficient funds to double down!');
      return;
    }

    // Double the bet
    setPlayerBank(prev => prev - currentBet);
    setCurrentBet(prev => prev * 2);

    // Take exactly one card
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);

    const newScore = calculateHandValue(newHand);

    if (newScore > 21) {
      // Busted
      setShowDealerCard(true);
      setStatus("Player Busts! Dealer wins.");
      setGameState(GAME_STATES.GAME_OVER);
    } else {
      // Auto-stand after double down
      setTimeout(() => stand(newHand), 500);
    }
  }, [gameState, playerHand, playerBank, currentBet, drawCard, stand]);

  /**
   * Reset game to initial state
   */
  const resetGame = useCallback(() => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerBank(STARTING_BANK);
    setCurrentBet(0);
    setStatus('Game reset. Place your bet!');
    setGameState(GAME_STATES.BETTING);
    setShowDealerCard(false);
    resetDeck();
  }, [resetDeck]);

  /**
   * Start new round without resetting bank
   */
  const newRound = useCallback(() => {
    if (playerBank <= 0) {
      setStatus('Game Over! You ran out of money. Click Reset.');
      return;
    }

    setPlayerHand([]);
    setDealerHand([]);
    setCurrentBet(0);
    setStatus('Place your bet!');
    setGameState(GAME_STATES.BETTING);
    setShowDealerCard(false);
  }, [playerBank]);

  // Auto-start new round when game is over (after a delay)
  useEffect(() => {
    if (gameState === GAME_STATES.GAME_OVER) {
      const timer = setTimeout(() => {
        if (playerBank > 0) {
          // Don't auto-start, let player choose
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState, playerBank]);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      {/* Dealer's Hand */}
      <Hand
        cards={dealerHand}
        showAllCards={showDealerCard}
        label="Dealer"
        showValue={showDealerCard}
        value={dealerScore}
      />

      {/* Game Title */}
      <div className="text-white text-5xl font-bold mb-2 mt-8 text-shadow-lg">BLACKJACK</div>
      <div className="text-yellow-400 text-2xl mb-4">Pays 3 to 2</div>

      {/* Status */}
      <div className="text-white text-xl mb-6 bg-black bg-opacity-50 px-6 py-3 rounded-lg min-w-[300px] text-center">
        {status}
      </div>

      {/* Player's Hand */}
      <Hand
        cards={playerHand}
        showAllCards={true}
        label="Player"
        showValue={playerHand.length > 0}
        value={playerScore}
      />

      {/* Game Controls */}
      <div className="my-6">
        <GameControls
          onDeal={initialDeal}
          onHit={hit}
          onStand={() => stand()}
          onDoubleDown={doubleDown}
          onReset={resetGame}
          canDeal={gameState === GAME_STATES.DEALING}
          canHit={gameState === GAME_STATES.PLAYER_TURN}
          canStand={gameState === GAME_STATES.PLAYER_TURN}
          canDouble={gameState === GAME_STATES.PLAYER_TURN && checkCanDoubleDown(playerHand) && playerBank >= currentBet}
          gameOver={gameState === GAME_STATES.GAME_OVER}
        />
      </div>

      {/* Betting Area */}
      <div className="mb-4">
        <div className="text-white text-lg mb-3 text-center">Place Your Bet</div>
        <div className="flex gap-3 flex-wrap justify-center">
          {BET_DENOMINATIONS.map(amount => (
            <ChipButton
              key={amount}
              value={amount}
              onClick={() => handleBet(amount)}
              disabled={gameState !== GAME_STATES.BETTING || playerBank < amount}
            />
          ))}
        </div>
      </div>

      {/* Player Bank & Info */}
      <div className="text-white text-3xl font-bold bg-green-800 bg-opacity-70 px-8 py-4 rounded-lg border-4 border-yellow-500">
        Bank: ${playerBank}
      </div>

      {currentBet > 0 && (
        <div className="text-yellow-400 text-xl mt-2">
          Current Bet: ${currentBet}
        </div>
      )}

      {/* New Round Button */}
      {gameState === GAME_STATES.GAME_OVER && playerBank > 0 && (
        <button
          onClick={newRound}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          New Round
        </button>
      )}

      {/* Debug Info (remove in production) */}
      <div className="text-white text-xs mt-4 opacity-50">
        Cards remaining: {cardsRemaining}
      </div>
    </div>
  );
};

export default Blackjack;
