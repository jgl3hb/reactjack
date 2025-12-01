import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import './cardstarter.css';
import { useDeck } from './hooks/useDeck';
import {
  calculateHandValue,
  isBlackjack,
  determineWinner,
  shouldDealerHit,
  canDoubleDown as checkCanDoubleDown,
  canSplit as checkCanSplit
} from './hooks/useBlackjackGame';
import { STARTING_BANK, BET_DENOMINATIONS, GAME_STATES } from './utils/gameConstants';
import ChipButton from './components/ChipButton';
import GameControls from './components/GameControls';
import Hand from './components/Hand';

const Blackjack = () => {
  // Game state - Modified to support multiple hands for splits
  const [playerHands, setPlayerHands] = useState([[]]); // Array of hands
  const [activeHandIndex, setActiveHandIndex] = useState(0); // Which hand is being played
  const [handBets, setHandBets] = useState([]); // Bet for each hand
  const [handStatuses, setHandStatuses] = useState([]); // Status for each hand (playing, stood, busted, won, lost)
  const [dealerHand, setDealerHand] = useState([]);
  const [playerBank, setPlayerBank] = useState(STARTING_BANK);
  const [currentBet, setCurrentBet] = useState(0);
  const [status, setStatus] = useState('Place your bet to begin!');
  const [gameState, setGameState] = useState(GAME_STATES.BETTING);
  const [showDealerCard, setShowDealerCard] = useState(false);

  // Deck management
  const { drawCard, resetDeck, cardsRemaining } = useDeck();

  // Get  current active hand
  const currentHand = playerHands[activeHandIndex] || [];
  const currentHandScore = calculateHandValue(currentHand);
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
      setPlayerHands([[]]);
      setActiveHandIndex(0);
      setHandBets([betAmount]);
      setHandStatuses(['playing']);
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
   */
  const initialDeal = useCallback(() => {
    if (gameState !== GAME_STATES.DEALING) {
      return;
    }

    // Deal 2 cards to each
    const newPlayerHand = [drawCard(), drawCard()];
    const newDealerHand = [drawCard(), drawCard()];

    setPlayerHands([newPlayerHand]);
    setDealerHand(newDealerHand);
    setActiveHandIndex(0);
    setHandStatuses(['playing']);

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
      setHandStatuses([result.status]);
    } else {
      setStatus('Hit, Stand, or Double Down?');
      setGameState(GAME_STATES.PLAYER_TURN);
    }
  }, [gameState, drawCard, currentBet]);

  /**
   * Player hits (draws a card) for current active hand
   */
  const hit = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;
    if (handStatuses[activeHandIndex] !== 'playing') return;

    const newHands = [...playerHands];
    newHands[activeHandIndex] = [...newHands[activeHandIndex], drawCard()];
    setPlayerHands(newHands);

    const newScore = calculateHandValue(newHands[activeHandIndex]);

    if (newScore > 21) {
      // Hand busted
      const newStatuses = [...handStatuses];
      newStatuses[activeHandIndex] = 'busted';
      setHandStatuses(newStatuses);

      // Move to next hand or dealer
      moveToNextHand(newHands, newStatuses);
    } else if (newScore === 21) {
      // Auto-stand on 21
      stand();
    }
  }, [gameState, playerHands, activeHandIndex, handStatuses, drawCard]);

  /**
   * Player stands (end turn for current hand)
   */
  const stand = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;
    if (handStatuses[activeHandIndex] !== 'playing') return;

    const newStatuses = [...handStatuses];
    newStatuses[activeHandIndex] = 'stood';
    setHandStatuses(newStatuses);

    // Move to next hand or dealer's turn
    moveToNextHand(playerHands, newStatuses);
  }, [gameState, playerHands, activeHandIndex, handStatuses]);

  /**
   * Move to next hand or trigger dealer's turn
   */
  const moveToNextHand = useCallback((hands, statuses) => {
    // Find next hand that needs to be played
    const nextHandIndex = statuses.findIndex((status, idx) =>
      idx > activeHandIndex && status === 'playing'
    );

    if (nextHandIndex !== -1) {
      // Move to next hand
      setActiveHandIndex(nextHandIndex);
      setStatus(`Playing hand ${nextHandIndex + 1} of ${hands.length}`);
    } else {
      // All hands played, dealer's turn
      playDealerHand(hands, statuses);
    }
  }, [activeHandIndex]);

  /**
   * Dealer plays their hand
   */
  const playDealerHand = useCallback((hands, statuses) => {
    setGameState(GAME_STATES.DEALER_TURN);
    setShowDealerCard(true);

    // Dealer draws cards
    let newDealerHand = [...dealerHand];
    let dealerValue = calculateHandValue(newDealerHand);

    while (shouldDealerHit(dealerValue)) {
      newDealerHand.push(drawCard());
      dealerValue = calculateHandValue(newDealerHand);
    }

    setDealerHand(newDealerHand);

    // Determine winner for each hand
    let totalPayout = 0;
    const finalStatuses = statuses.map((status, idx) => {
      if (status === 'busted') return 'lost';

      const result = determineWinner(
        calculateHandValue(hands[idx]),
        dealerValue,
        hands[idx],
        newDealerHand,
        handBets[idx]
      );

      totalPayout += result.payout;
      return result.status === 'win' ? 'won' : result.status === 'push' ? 'push' : 'lost';
    });

    setHandStatuses(finalStatuses);
    setPlayerBank(prev => prev + totalPayout);

    // Set overall status message
    const wins = finalStatuses.filter(s => s === 'won').length;
    const losses = finalStatuses.filter(s => s === 'lost').length;
    const pushes = finalStatuses.filter(s => s === 'push').length;

    if (wins > 0 && losses === 0) {
      setStatus(`You won ${wins} hand(s)!`);
    } else if (losses > 0 && wins === 0) {
      setStatus(`Dealer won ${losses} hand(s).`);
    } else if (wins > 0 && losses > 0) {
      setStatus(`Mixed results: ${wins} won, ${losses} lost${pushes > 0 ? `, ${pushes} pushed` : ''}`);
    } else {
      setStatus(`All hands pushed!`);
    }

    setGameState(GAME_STATES.GAME_OVER);
  }, [dealerHand, drawCard, handBets]);

  /**
   * Double down - double bet, take one card, then stand
   */
  const doubleDown = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;
    if (!checkCanDoubleDown(currentHand)) return;
    if (handStatuses[activeHandIndex] !== 'playing') return;

    const betToAdd = handBets[activeHandIndex];
    if (playerBank < betToAdd) {
      setStatus('Insufficient funds to double down!');
      return;
    }

    // Double the bet for this hand
    setPlayerBank(prev => prev - betToAdd);
    const newBets = [...handBets];
    newBets[activeHandIndex] = newBets[activeHandIndex] * 2;
    setHandBets(newBets);

    // Take exactly one card
    const newHands = [...playerHands];
    newHands[activeHandIndex] = [...newHands[activeHandIndex], drawCard()];
    setPlayerHands(newHands);

    const newScore = calculateHandValue(newHands[activeHandIndex]);

    const newStatuses = [...handStatuses];
    if (newScore > 21) {
      // Busted
      newStatuses[activeHandIndex] = 'busted';
      setHandStatuses(newStatuses);
      moveToNextHand(newHands, newStatuses);
    } else {
      // Auto-stand after double down
      newStatuses[activeHandIndex] = 'stood';
      setHandStatuses(newStatuses);
      setTimeout(() => moveToNextHand(newHands, newStatuses), 500);
    }
  }, [gameState, currentHand, playerBank, handBets, activeHandIndex, handStatuses, playerHands, drawCard, moveToNextHand]);

  /**
   * Split - split matching cards into two hands
   */
  const split = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;
    if (!checkCanSplit(currentHand)) return;
    if (handStatuses[activeHandIndex] !== 'playing') return;
    if (playerHands.length >= 4) {
      setStatus('Maximum 4 hands reached!');
      return;
    }

    const betToAdd = handBets[activeHandIndex];
    if (playerBank < betToAdd) {
      setStatus('Insufficient funds to split!');
      return;
    }

    // Deduct additional bet
    setPlayerBank(prev => prev - betToAdd);

    // Split the hand
    const newHands = [...playerHands];
    const handToSplit = newHands[activeHandIndex];

    // Create two new hands, each with one card from the split
    const hand1 = [handToSplit[0], drawCard()];
    const hand2 = [handToSplit[1], drawCard()];

    // Replace current hand with first split hand
    newHands[activeHandIndex] = hand1;
    // Insert second split hand right after
    newHands.splice(activeHandIndex + 1, 0, hand2);

    setPlayerHands(newHands);

    // Update bets and statuses
    const newBets = [...handBets];
    newBets.splice(activeHandIndex + 1, 0, betToAdd);
    setHandBets(newBets);

    const newStatuses = [...handStatuses];
    newStatuses.splice(activeHandIndex + 1, 0, 'playing');
    setHandStatuses(newStatuses);

    setStatus(`Hand split! Playing hand 1 of ${newHands.length}`);
  }, [gameState, currentHand, playerBank, handBets, activeHandIndex, handStatuses, playerHands, drawCard]);

  /**
   * Reset game to initial state
   */
  const resetGame = useCallback(() => {
    setPlayerHands([[]]);
    setActiveHandIndex(0);
    setHandBets([]);
    setHandStatuses([]);
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

    setPlayerHands([[]]);
    setActiveHandIndex(0);
    setHandBets([]);
    setHandStatuses([]);
    setDealerHand([]);
    setCurrentBet(0);
    setStatus('Place your bet!');
    setGameState(GAME_STATES.BETTING);
    setShowDealerCard(false);
  }, [playerBank]);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      {/* Dealer's Hand */}
      <Hand
        cards={dealerHand}
        showAllCards={showDealerCard}
        label="Dealer"
        showValue={showDealerCard}
        alwaysShowValue={true}
        value={dealerScore}
      />

      {/* Game Title */}
      <div className="text-white text-5xl font-bold mb-2 mt-8 text-shadow-lg">BLACKJACK</div>
      <div className="text-yellow-400 text-2xl mb-4">Pays 3 to 2</div>

      {/* Status */}
      <div className="text-white text-xl mb-6 bg-black bg-opacity-50 px-6 py-3 rounded-lg min-w-[300px] text-center">
        {status}
      </div>

      {/* Player's Hands (can be multiple if split) */}
      <div className="flex flex-wrap gap-6 justify-center mb-4">
        {playerHands.map((hand, idx) => {
          if (hand.length === 0 && idx === 0) return null;

          const isActive = idx === activeHandIndex && gameState === GAME_STATES.PLAYER_TURN && handStatuses[idx] === 'playing';
          const handScore = calculateHandValue(hand);
          const handStatus = handStatuses[idx];

          let borderColor = 'border-gray-500';
          if (isActive) borderColor = 'border-yellow-400';
          else if (handStatus === 'won') borderColor = 'border-green-500';
          else if (handStatus === 'lost' || handStatus === 'busted') borderColor = 'border-red-500';
          else if (handStatus === 'push') borderColor = 'border-blue-500';

          return (
            <div key={idx} className={`border-4 ${borderColor} rounded-lg p-4 ${isActive ? 'shadow-2xl' : ''}`}>
              <Hand
                cards={hand}
                showAllCards={true}
                label={playerHands.length > 1 ? `Hand ${idx + 1}` : 'Player'}
                showValue={hand.length > 0}
                value={handScore}
              />
              {handBets[idx] && (
                <div className="text-yellow-400 text-sm mt-2">
                  Bet: ${handBets[idx]}
                </div>
              )}
              {handStatus && handStatus !== 'playing' && (
                <div className={`text-sm mt-1 font-bold ${handStatus === 'won' ? 'text-green-400' :
                  handStatus === 'lost' || handStatus === 'busted' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                  {handStatus === 'busted' ? 'BUST' : handStatus.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Controls */}
      <div className="my-6">
        <GameControls
          onDeal={initialDeal}
          onHit={hit}
          onStand={stand}
          onDoubleDown={doubleDown}
          onSplit={split}
          onReset={resetGame}
          canDeal={gameState === GAME_STATES.DEALING}
          canHit={gameState === GAME_STATES.PLAYER_TURN && handStatuses[activeHandIndex] === 'playing'}
          canStand={gameState === GAME_STATES.PLAYER_TURN && handStatuses[activeHandIndex] === 'playing'}
          canDouble={gameState === GAME_STATES.PLAYER_TURN && checkCanDoubleDown(currentHand) && playerBank >= (handBets[activeHandIndex] || 0) && handStatuses[activeHandIndex] === 'playing'}
          canSplit={gameState === GAME_STATES.PLAYER_TURN && checkCanSplit(currentHand) && playerBank >= (handBets[activeHandIndex] || 0) && playerHands.length < 4 && handStatuses[activeHandIndex] === 'playing'}
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

      {currentBet > 0 && gameState !== GAME_STATES.GAME_OVER && (
        <div className="text-yellow-400 text-xl mt-2">
          Total Bet: ${handBets.reduce((sum, bet) => sum + bet, 0) || currentBet}
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

      {/* Debug Info */}
      <div className="text-white text-xs mt-4 opacity-50">
        Cards remaining: {cardsRemaining} | Hands: {playerHands.length}
      </div>
    </div>
  );
};

export default Blackjack;
