import React, { useState, useEffect } from 'react';
import './App.css';
import './cardstarter.css';



const deckData = [
  "dA", "dQ", "dK", "dJ", "d10", "d09", "d08", "d07", "d06", "d05", "d04", "d03", "d02",
  "hA", "hQ", "hK", "hJ", "h10", "h09", "h08", "h07", "h06", "h05", "h04", "h03", "h02",
  "cA", "cQ", "cK", "cJ", "c10", "c09", "c08", "c07", "c06", "c05", "c04", "c03", "c02",
  "sA", "sQ", "sK", "sJ", "s10", "s09", "s08", "s07", "s06", "s05", "s04", "s03", "s02"
];

const Blackjack = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerBank, setPlayerBank] = useState(500);
  const [currentBet, setCurrentBet] = useState(0);
  const [deck, setDeck] = useState(deckData);
  const [status, setStatus] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const cardLookup = (card) => {
    const cardValueStr = card.slice(1);
    let value;
    if (cardValueStr === 'A') {
      value = 11;
    } else if (['K', 'Q', 'J'].includes(cardValueStr)) {
      value = 10;
    } else {
      value = parseInt(cardValueStr, 10);
    }
    return value;
  };

  const computeHandTotal = (hand) => {
    const total = handleAces(hand, hand.reduce((total, card) => total + cardLookup(card), 0));
    console.log('computeHandTotal:', hand, total);
    return total;
  };

  const handleAces = (hand, total) => {
    let aces = hand.filter(card => card[1] === 'A');
    aces.forEach(() => { if (total > 21) total -= 10; });
    return total;
  };

  useEffect(() => {
    setPlayerScore(computeHandTotal(playerHand));
    setDealerScore(computeHandTotal(dealerHand));
  }, [playerHand, dealerHand]);

  const renderCard = (hand, deckId) => {
    return hand.map((card, i) => (
      <div
        key={i}
        className={`card large ${deckId === 'dealer-cards' && i === 1 && !gameOver ? 'back-red' : card}`}
      ></div>
    ));
  };

  const handleBet = (betAmount) => {
    if (playerBank >= betAmount) {
      setPlayerHand([]);
      setDealerHand([]);
      setPlayerScore(0);
      setDealerScore(0);
      setGameOver(false);
      setStatus(`Player Bet is $${betAmount}, Press Deal`);
      setCurrentBet(betAmount);
      setPlayerBank(playerBank - betAmount);
    } else {
      setStatus(`You don't have enough money. Game over.`);
    }
  };

  const selectCard = () => {
    const newDeck = [...deck];
    const selectedCard = newDeck.splice(Math.floor(Math.random() * newDeck.length), 1)[0];
    setDeck(newDeck);
    return selectedCard;
  };

  const dealCard = (hand, callback) => {
    const newHand = [...hand, selectCard()];
    callback(newHand);
  };

  const initialDeal = () => {
    let tempPlayerHand = [];
    let tempDealerHand = [];
    for (let i = 0; i < 2; i++) {
      tempPlayerHand.push(selectCard());
      tempDealerHand.push(selectCard());
    }
    setPlayerHand(tempPlayerHand);
    setDealerHand(tempDealerHand);
    setStatus('Hit or Stand?');
  };

  const hit = () => {
    if (!gameOver) {
      dealCard(playerHand, (newHand) => {
        setPlayerHand(newHand);
        const newScore = computeHandTotal(newHand);
        setPlayerScore(newScore);
        if (newScore > 21) {
          setGameOver(true);
          setStatus("Player Busts, Dealer Wins");
        }
      });
    }
  };

  const stand = () => {
    if (!gameOver) {
      let newDealerHand = [...dealerHand];
      while (computeHandTotal(newDealerHand) <= 17) {
        newDealerHand.push(selectCard());
      }
      setDealerHand(newDealerHand);
      const newDealerScore = computeHandTotal(newDealerHand);
      setDealerScore(newDealerScore);
      renderWin(playerScore, newDealerScore);
    }
  };

  const renderBlackjack = () => {
    setPlayerScore(computeHandTotal(playerHand));
    setDealerScore(computeHandTotal(dealerHand));
  };

  const renderWin = (playerScore, dealerScore) => {
    if (playerScore > 21) {
      setGameOver(true);
      setCurrentBet(0);
      setStatus("Player Busts, Dealer Wins");
    } else if (dealerScore > 21) {
      setGameOver(true);
      setPlayerBank(playerBank + currentBet * 2);
      setCurrentBet(0);
      setStatus("Dealer Busts, Player Wins!");
    } else if (playerScore > dealerScore && playerScore <= 21) {
      setGameOver(true);
      setPlayerBank(playerBank + currentBet * 2);
      setCurrentBet(0);
      setStatus("Player Wins!");
    } else if (dealerScore <= 21) {
      setGameOver(true);
      setCurrentBet(0);
      setStatus("Dealer Wins");
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerBank(500);
    setCurrentBet(0);
    setDeck(deckData);
    setStatus('Game reset. Place your bet!');
    setGameOver(false);
  };

  useEffect(() => {
    renderBlackjack();
  }, [playerHand, dealerHand]);

  return (
    <div className="min-h-screen bg-green-600 p-4 flex flex-col items-center justify-center">
      <div className="text-white mb-4" id="status">{status}</div>
      <div className="flex justify-center mb-4" id="dealer-cards">{renderCard(dealerHand, 'dealer-cards')}</div>
      <div className="flex justify-center mb-4" id="player-cards">{renderCard(playerHand, 'player-cards')}</div>
      <div className="text-white mb-4" id="playerhandvalue">{playerScore}</div>
      <div className="flex space-x-4 mb-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={initialDeal}>Deal</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={hit}>Hit</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={stand}>Stand</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={resetGame}>Reset</button>
      </div>
      <div className="flex space-x-4 mb-4" id="betting-area">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleBet(1)}>Bet 1</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleBet(5)}>Bet 5</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleBet(25)}>Bet 25</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleBet(100)}>Bet 100</button>
      </div>
      <div className="text-white mb-4" id="playerBank">${playerBank}</div>
    </div>
  );
};

export default Blackjack;
