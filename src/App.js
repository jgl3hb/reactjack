import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './App.css';
import './cardstarter.css';
import { useDeck } from './hooks/useDeck';
import {
  calculateHandValue,
  isBlackjack,
  determineWinner,
  shouldDealerHit,
  canSplit,
  canDoubleDown,
  getCardRank
} from './hooks/useBlackjackGame';
import { STARTING_BANK, BET_DENOMINATIONS, GAME_STATES } from './utils/gameConstants';
import {
  CPU_BEHAVIORS,
  getCpuRoundBet,
  getCpuDisplayBetLabel,
  chooseCpuAction,
  summarizeSeatResult
} from './utils/cpuLogic';
import { DEFAULT_TABLE_RULES } from './utils/tableRules';
import { CHARACTERS, getCharacter } from './utils/characters';
import { getCharacterDialogue } from './utils/personalityDialogue';
import { getHiLoValue, calculateTrueCount } from './utils/cardCounting';
import {
  playCardDealSound,
  playChipSound,
  playWinSound,
  playBustSound,
  setMuted,
  isMuted
} from './utils/soundEffects';
import ChipButton from './components/ChipButton';
import GameControls from './components/GameControls';
import Hand from './components/Hand';
import CharacterAvatar from './components/CharacterAvatar';
import SpeechBubble from './components/SpeechBubble';
import TableTalkLog from './components/TableTalkLog';
import CardCountingTrainer from './components/CardCountingTrainer';

const SEAT_ORDER = ['alice', 'human', 'bob', 'chuck', 'jimbob'];
const HUMAN_SEAT = 'human';
const CPU_SEATS = SEAT_ORDER.filter((seatId) => seatId !== HUMAN_SEAT);

const SEAT_DISPLAY_NAME = {
  alice: 'Alice',
  human: 'You',
  bob: 'Bob',
  chuck: 'Chuck',
  jimbob: 'Jim Bob'
};

const DEFAULT_IDENTITY_STRATEGY = {
  alice: 'basic',
  bob: 'risk',
  chuck: 'counter',
  jimbob: 'rookie'
};

const seatName = (seatId) => SEAT_DISPLAY_NAME[seatId] || seatId;
const buildSeatScalar = (value) => Object.fromEntries(SEAT_ORDER.map((seatId) => [seatId, value]));
const buildSeatLists = () => Object.fromEntries(SEAT_ORDER.map((seatId) => [seatId, []]));

const Blackjack = () => {
  const { drawCard, resetDeck, cardsRemaining } = useDeck();

  const [seatConfigs, setSeatConfigs] = useState({
    alice: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.alice },
    bob: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.bob },
    chuck: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.chuck },
    jimbob: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.jimbob }
  });

  const [banks, setBanks] = useState(buildSeatScalar(STARTING_BANK));
  const [seatBets, setSeatBets] = useState(buildSeatLists());
  const [seatHands, setSeatHands] = useState(buildSeatLists());
  const [seatStatuses, setSeatStatuses] = useState(buildSeatLists());
  const [dealerHand, setDealerHand] = useState([]);
  const [turnQueue, setTurnQueue] = useState([]);
  const [pendingHumanBet, setPendingHumanBet] = useState(0);
  const [status, setStatus] = useState('Choose lineup and place your bet to begin.');
  const [gameState, setGameState] = useState(GAME_STATES.BETTING);
  const [showDealerCard, setShowDealerCard] = useState(false);

  const [tableRules, setTableRules] = useState(DEFAULT_TABLE_RULES);
  const [insuranceOffered, setInsuranceOffered] = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);
  const [pendingPeekSettlement, setPendingPeekSettlement] = useState(null);

  const [runningCount, setRunningCount] = useState(0);
  const [cardsSeen, setCardsSeen] = useState(0);

  const [showLaunchConfig, setShowLaunchConfig] = useState(true);
  const [launchCpuCount, setLaunchCpuCount] = useState(0);
  const [selectedCpuIds, setSelectedCpuIds] = useState([]);

  // Personality dialogue and table banter state
  const [speechBubbles, setSpeechBubbles] = useState({});
  const [tableMessages, setTableMessages] = useState([]);
  const [showTableTalk, setShowTableTalk] = useState(false);

  // Card Counting Trainer state
  const [showCardTags, setShowCardTags] = useState(true);
  const [quizMode, setQuizMode] = useState(false);

  // Audio and game speed state
  const [audioMuted, setAudioMuted] = useState(isMuted());
  const [gameSpeed, setGameSpeed] = useState('normal'); // 'normal' (500ms), 'fast' (200ms), 'instant' (0ms)
  const [showRulesPanel, setShowRulesPanel] = useState(false);

  const activeSeatId = turnQueue.length > 0 ? turnQueue[0] : null;
  const dealerScore = calculateHandValue(dealerHand);
  const dealerUpCard = dealerHand[0];
  const canConfigureSeats = gameState === GAME_STATES.BETTING || gameState === GAME_STATES.GAME_OVER;

  const decksRemaining = Math.max(cardsRemaining / 52, 0.25);
  const trueCount = calculateTrueCount(runningCount, cardsRemaining);

  const triggerBanter = useCallback((characterId, eventType, context = {}) => {
    if (!characterId || characterId === HUMAN_SEAT) return;
    const line = getCharacterDialogue(characterId, eventType, context);
    if (!line) return;

    setSpeechBubbles((prev) => ({ ...prev, [characterId]: line }));
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTableMessages((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        speaker: seatName(characterId),
        characterId,
        text: line,
        time: timeStr
      },
      ...prev.slice(0, 49)
    ]);

    setTimeout(() => {
      setSpeechBubbles((prev) => {
        if (prev[characterId] === line) {
          return { ...prev, [characterId]: null };
        }
        return prev;
      });
    }, 4200);
  }, []);

  const drawTrackedCard = useCallback(() => {
    const card = drawCard();
    if (card) {
      playCardDealSound();
      setRunningCount((prev) => prev + getHiLoValue(card));
      setCardsSeen((prev) => prev + 1);
    }
    return card;
  }, [drawCard]);

  useEffect(() => {
    setSelectedCpuIds([]);
  }, [launchCpuCount]);

  const toggleCpuIdentity = useCallback((seatId) => {
    setSelectedCpuIds((prev) => {
      if (launchCpuCount === 0) return [];
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= launchCpuCount) {
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  }, [launchCpuCount]);

  const applyLaunchConfig = useCallback(() => {
    if (selectedCpuIds.length !== launchCpuCount) return;

    const nextSeatConfigs = {
      alice: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.alice },
      bob: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.bob },
      chuck: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.chuck },
      jimbob: { enabled: false, strategy: DEFAULT_IDENTITY_STRATEGY.jimbob }
    };

    selectedCpuIds.forEach((seatId) => {
      nextSeatConfigs[seatId].enabled = true;
    });

    setSeatConfigs(nextSeatConfigs);
    setShowLaunchConfig(false);
    setStatus('Lineup set. Place your bet and click Deal.');
  }, [launchCpuCount, selectedCpuIds]);

  const getRoundSeats = useCallback((betLists) => {
    return SEAT_ORDER.filter((seatId) => (betLists[seatId] || []).length > 0);
  }, []);

  const playDealerAndSettle = useCallback(
    (roundSeats, finalHands, finalStatuses, finalBets, startingDealerHand = null, insuranceWagerOverride = null) => {
      setGameState(GAME_STATES.DEALER_TURN);
      setShowDealerCard(true);

      let nextDealerHand = startingDealerHand ? [...startingDealerHand] : [...dealerHand];
      let dealerTotal = calculateHandValue(nextDealerHand);

      while (shouldDealerHit(dealerTotal, nextDealerHand, tableRules)) {
        nextDealerHand.push(drawTrackedCard());
        dealerTotal = calculateHandValue(nextDealerHand);
      }

      setDealerHand(nextDealerHand);

      const settledStatuses = { ...finalStatuses };
      const payoutBySeat = buildSeatScalar(0);
      const summary = [];

      roundSeats.forEach((seatId) => {
        const hands = finalHands[seatId] || [];
        const bets = finalBets[seatId] || [];
        const perHandStatuses = [];
        let seatPayout = 0;

        hands.forEach((hand, handIdx) => {
          if ((finalStatuses[seatId] || [])[handIdx] === 'surrendered') {
            const handBet = bets[handIdx] || 0;
            seatPayout += handBet * 0.5;
            perHandStatuses.push('surrendered');
            return;
          }

          const handTotal = calculateHandValue(hand);
          const handBet = bets[handIdx] || 0;
          const playerNaturalBlackjack = hands.length === 1 && handIdx === 0 && isBlackjack(hand);
          const dealerNaturalBlackjack = isBlackjack(nextDealerHand);

          const result = determineWinner(
            handTotal,
            dealerTotal,
            hand,
            nextDealerHand,
            handBet,
            {
              playerNaturalBlackjack,
              dealerNaturalBlackjack,
              blackjackPayoutMultiplier: tableRules.blackjackPayout
            }
          );

          seatPayout += result.payout;
          perHandStatuses.push(result.status === 'win' ? 'won' : result.status === 'push' ? 'push' : 'lost');
        });

        settledStatuses[seatId] = perHandStatuses;
        payoutBySeat[seatId] = seatPayout;
        const seatResult = summarizeSeatResult(perHandStatuses);
        summary.push(`${seatName(seatId)}: ${seatResult}`);

        // Trigger personality banter on round settlement
        if (seatId !== HUMAN_SEAT) {
          if (seatResult.includes('won')) {
            triggerBanter(seatId, 'round_win');
          } else if (seatResult.includes('lost') || seatResult.includes('busted')) {
            triggerBanter(seatId, 'round_loss');
          } else if (seatResult.includes('push')) {
            triggerBanter(seatId, 'round_push');
          }
        }
      });

      const activeInsuranceBet = insuranceWagerOverride ?? insuranceBet;
      if (activeInsuranceBet > 0) {
        const dealerNaturalBlackjack = isBlackjack(nextDealerHand);
        payoutBySeat.human += dealerNaturalBlackjack ? activeInsuranceBet * 3 : 0;
      }

      // Audio cues for settlement
      const humanFinalStatuses = settledStatuses.human || [];
      if (humanFinalStatuses.some((s) => s === 'won')) {
        playWinSound();
      } else if (humanFinalStatuses.some((s) => s === 'lost' || s === 'busted')) {
        playBustSound();
      }

      setSeatStatuses(settledStatuses);
      setBanks((prev) => {
        const next = { ...prev };
        SEAT_ORDER.forEach((seatId) => {
          next[seatId] = prev[seatId] + (payoutBySeat[seatId] || 0);
        });
        return next;
      });

      setStatus(`Round settled (${summary.join(', ')})`);
      setGameState(GAME_STATES.GAME_OVER);
      setInsuranceOffered(false);
      setInsuranceBet(0);
      setPendingPeekSettlement(null);
    },
    [dealerHand, drawTrackedCard, insuranceBet, tableRules, triggerBanter]
  );

  const initialDeal = useCallback(() => {
    if (gameState !== GAME_STATES.BETTING || showLaunchConfig) return;

    if (pendingHumanBet <= 0) {
      setStatus('Choose a human bet first.');
      return;
    }

    if (banks.human < pendingHumanBet) {
      setStatus(`Insufficient human funds. Bank: $${banks.human}`);
      return;
    }

    const nextSeatBets = buildSeatLists();
    nextSeatBets.human = [pendingHumanBet];

    CPU_SEATS.forEach((seatId) => {
      if (!seatConfigs[seatId]?.enabled || banks[seatId] <= 0) return;
      const cpuBet = getCpuRoundBet(seatConfigs[seatId].strategy, banks[seatId], { trueCount });
      if (cpuBet > 0) nextSeatBets[seatId] = [cpuBet];
    });

    const roundSeats = getRoundSeats(nextSeatBets);
    if (roundSeats.length === 0) {
      setStatus('No active seats available for this round.');
      return;
    }

    const nextHands = buildSeatLists();
    const nextStatuses = buildSeatLists();
    const nextDealerHand = [drawTrackedCard(), drawTrackedCard()];

    roundSeats.forEach((seatId) => {
      const hand = [drawTrackedCard(), drawTrackedCard()];
      nextHands[seatId] = [hand];
      const isNatural = isBlackjack(hand);
      nextStatuses[seatId] = [isNatural ? 'blackjack' : 'playing'];

      // CPU reacts to its dealt cards
      if (seatId !== HUMAN_SEAT) {
        if (isNatural) {
          triggerBanter(seatId, 'deal_blackjack');
        } else if (calculateHandValue(hand) >= 19) {
          triggerBanter(seatId, 'deal_strong');
        } else if (calculateHandValue(hand) === 16) {
          triggerBanter(seatId, 'deal_stiff');
        }
      }
    });

    setBanks((prev) => {
      const next = { ...prev };
      SEAT_ORDER.forEach((seatId) => {
        next[seatId] = prev[seatId] - ((nextSeatBets[seatId] || [])[0] || 0);
      });
      return next;
    });

    setSeatBets(nextSeatBets);
    setSeatHands(nextHands);
    setSeatStatuses(nextStatuses);
    setDealerHand(nextDealerHand);
    setShowDealerCard(false);
    setGameState(GAME_STATES.PLAYER_TURN);
    setInsuranceBet(0);
    setPendingPeekSettlement(null);

    // If human got blackjack, CPU players may react
    if (nextStatuses.human?.[0] === 'blackjack') {
      playWinSound();
      if (seatConfigs.bob?.enabled) triggerBanter('bob', 'react_human_blackjack');
      else if (seatConfigs.alice?.enabled) triggerBanter('alice', 'react_human_blackjack');
      else if (seatConfigs.chuck?.enabled) triggerBanter('chuck', 'react_human_blackjack');
      else if (seatConfigs.jimbob?.enabled) triggerBanter('jimbob', 'react_human_blackjack');
    }

    const nextQueue = roundSeats.filter((seatId) => nextStatuses[seatId][0] === 'playing');
    const dealerUpRank = getCardRank(nextDealerHand[0]);
    const shouldOfferInsurance = tableRules.offerInsurance && dealerUpRank === 'A' && roundSeats.includes(HUMAN_SEAT);
    setInsuranceOffered(shouldOfferInsurance);
    setTurnQueue(nextQueue);

    const dealerHasBlackjack = isBlackjack(nextDealerHand);
    const dealerUpIsTenValue = ['10', 'J', 'Q', 'K'].includes(dealerUpRank);
    const shouldPeek = tableRules.dealerPeeksForBlackjack && (dealerUpRank === 'A' || dealerUpIsTenValue);

    if (shouldPeek && dealerHasBlackjack && shouldOfferInsurance) {
      setTurnQueue([]);
      setPendingPeekSettlement({ roundSeats, nextHands, nextStatuses, nextSeatBets, nextDealerHand });
      setStatus('Dealer shows Ace. Choose insurance.');
      return;
    }

    if ((shouldPeek && dealerHasBlackjack) || nextQueue.length === 0) {
      setTurnQueue([]);
      playDealerAndSettle(roundSeats, nextHands, nextStatuses, nextSeatBets, nextDealerHand);
      return;
    }

    setStatus(`Round started. ${seatName(nextQueue[0])} to act.`);
  }, [
    banks,
    drawTrackedCard,
    gameState,
    getRoundSeats,
    pendingHumanBet,
    playDealerAndSettle,
    seatConfigs,
    showLaunchConfig,
    tableRules,
    triggerBanter,
    trueCount
  ]);

  const standHuman = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT || insuranceOffered) return;

    const nextStatuses = {
      ...seatStatuses,
      human: [...(seatStatuses.human || [])]
    };

    const handIdx = nextStatuses.human.findIndex((handStatus) => handStatus === 'playing');
    if (handIdx === -1) return;

    nextStatuses.human[handIdx] = 'stood';
    setSeatStatuses(nextStatuses);

    // If there are more split hands to play, keep acting, else advance turn queue
    const remainingPlaying = nextStatuses.human.some((s) => s === 'playing');
    if (!remainingPlaying) {
      setTurnQueue((prev) => prev.slice(1));
    }
    setStatus('You stand.');
  }, [activeSeatId, gameState, insuranceOffered, seatStatuses]);

  const hitHuman = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT || insuranceOffered) return;

    const nextHands = {
      ...seatHands,
      human: (seatHands.human || []).map((hand) => [...hand])
    };
    const nextStatuses = {
      ...seatStatuses,
      human: [...(seatStatuses.human || [])]
    };

    const handIdx = nextStatuses.human.findIndex((handStatus) => handStatus === 'playing');
    if (handIdx === -1) return;

    nextHands.human[handIdx].push(drawTrackedCard());
    const total = calculateHandValue(nextHands.human[handIdx]);

    if (total > 21) {
      playBustSound();
      nextStatuses.human[handIdx] = 'busted';
      const remainingPlaying = nextStatuses.human.some((s) => s === 'playing');
      if (!remainingPlaying) {
        setTurnQueue((prev) => prev.slice(1));
      }
      setStatus('You bust.');

      // CPU reaction to human bust
      if (seatConfigs.bob?.enabled) triggerBanter('bob', 'react_human_bust');
      else if (seatConfigs.alice?.enabled) triggerBanter('alice', 'react_human_bust');
      else if (seatConfigs.jimbob?.enabled) triggerBanter('jimbob', 'react_human_bust');
    } else if (total === 21) {
      nextStatuses.human[handIdx] = 'stood';
      const remainingPlaying = nextStatuses.human.some((s) => s === 'playing');
      if (!remainingPlaying) {
        setTurnQueue((prev) => prev.slice(1));
      }
      setStatus('You reach 21 and stand.');
    } else {
      setStatus('You hit.');
    }

    setSeatHands(nextHands);
    setSeatStatuses(nextStatuses);
  }, [activeSeatId, drawTrackedCard, gameState, insuranceOffered, seatConfigs, seatHands, seatStatuses, triggerBanter]);

  // Human Double Down
  const doubleHuman = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT || insuranceOffered) return;

    const currentHands = seatHands.human || [];
    const currentStatuses = seatStatuses.human || [];
    const currentBets = seatBets.human || [];
    const handIdx = currentStatuses.findIndex((s) => s === 'playing');
    if (handIdx === -1) return;

    const hand = currentHands[handIdx];
    const bet = currentBets[handIdx] || 0;
    const isSplit = currentHands.length > 1;
    const doubleAllowed = !isSplit || tableRules.doubleAfterSplit;

    if (!canDoubleDown(hand) || !doubleAllowed || banks.human < bet) return;

    playChipSound();
    setBanks((prev) => ({ ...prev, human: prev.human - bet }));

    const nextBets = { ...seatBets, human: [...currentBets] };
    nextBets.human[handIdx] = bet * 2;
    setSeatBets(nextBets);

    const nextHands = { ...seatHands, human: currentHands.map((h) => [...h]) };
    const card = drawTrackedCard();
    nextHands.human[handIdx].push(card);
    setSeatHands(nextHands);

    const total = calculateHandValue(nextHands.human[handIdx]);
    const nextStatuses = { ...seatStatuses, human: [...currentStatuses] };

    // CPU reaction to double
    if (seatConfigs.bob?.enabled) triggerBanter('bob', 'react_human_double');
    else if (seatConfigs.alice?.enabled) triggerBanter('alice', 'react_human_double');

    if (total > 21) {
      playBustSound();
      nextStatuses.human[handIdx] = 'busted';
      const remainingPlaying = nextStatuses.human.some((s) => s === 'playing');
      if (!remainingPlaying) {
        setTurnQueue((prev) => prev.slice(1));
      }
      setStatus('You doubled down and busted.');
    } else {
      nextStatuses.human[handIdx] = 'stood';
      const remainingPlaying = nextStatuses.human.some((s) => s === 'playing');
      if (!remainingPlaying) {
        setTurnQueue((prev) => prev.slice(1));
      }
      setStatus(`You doubled down and stood with ${total}.`);
    }

    setSeatStatuses(nextStatuses);
  }, [
    activeSeatId,
    banks.human,
    drawTrackedCard,
    gameState,
    insuranceOffered,
    seatBets,
    seatConfigs,
    seatHands,
    seatStatuses,
    tableRules.doubleAfterSplit,
    triggerBanter
  ]);

  // Human Split
  const splitHuman = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT || insuranceOffered) return;

    const currentHands = seatHands.human || [];
    const currentStatuses = seatStatuses.human || [];
    const currentBets = seatBets.human || [];
    const handIdx = currentStatuses.findIndex((s) => s === 'playing');
    if (handIdx === -1) return;

    const hand = currentHands[handIdx];
    const bet = currentBets[handIdx] || 0;

    if (!canSplit(hand) || banks.human < bet || currentHands.length >= tableRules.maxSplitHands) return;

    const isAcePair = getCardRank(hand[0]) === 'A' && getCardRank(hand[1]) === 'A';
    if (isAcePair && !tableRules.allowResplitAces && currentHands.length > 1) return;

    playChipSound();
    setBanks((prev) => ({ ...prev, human: prev.human - bet }));

    const firstHand = [hand[0], drawTrackedCard()];
    const secondHand = [hand[1], drawTrackedCard()];

    const nextHands = { ...seatHands, human: [...currentHands] };
    nextHands.human.splice(handIdx, 1, firstHand, secondHand);
    setSeatHands(nextHands);

    const nextBets = { ...seatBets, human: [...currentBets] };
    nextBets.human.splice(handIdx, 1, bet, bet);
    setSeatBets(nextBets);

    const nextStatuses = { ...seatStatuses, human: [...currentStatuses] };
    if (tableRules.splitAcesOneCardOnly && isAcePair) {
      nextStatuses.human.splice(handIdx, 1, 'stood', 'stood');
      setSeatStatuses(nextStatuses);
      setTurnQueue((prev) => prev.slice(1));
      setStatus('Split Aces (one card each). Hand complete.');
    } else {
      nextStatuses.human.splice(handIdx, 1, 'playing', 'playing');
      setSeatStatuses(nextStatuses);
      setStatus('Split pair into two hands.');
    }
  }, [
    activeSeatId,
    banks.human,
    drawTrackedCard,
    gameState,
    insuranceOffered,
    seatBets,
    seatHands,
    seatStatuses,
    tableRules.allowResplitAces,
    tableRules.maxSplitHands,
    tableRules.splitAcesOneCardOnly
  ]);

  const surrenderHuman = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT) return;
    if (insuranceOffered || !tableRules.allowLateSurrender) return;

    const nextStatuses = {
      ...seatStatuses,
      human: [...(seatStatuses.human || [])]
    };

    const handIdx = nextStatuses.human.findIndex((handStatus) => handStatus === 'playing');
    if (handIdx !== 0) return;
    if ((seatHands.human || []).length !== 1) return;
    if ((seatHands.human[0] || []).length !== 2) return;

    nextStatuses.human[handIdx] = 'surrendered';
    setSeatStatuses(nextStatuses);
    setTurnQueue((prev) => prev.slice(1));
    setStatus('You surrendered (late surrender).');
  }, [activeSeatId, gameState, insuranceOffered, seatHands, seatStatuses, tableRules.allowLateSurrender]);

  const resolveInsuranceDecision = useCallback(
    (takeInsurance) => {
      if (!insuranceOffered && !pendingPeekSettlement) return;

      let insuranceAmount = 0;
      if (takeInsurance) {
        const mainBet = (seatBets.human || [])[0] || 0;
        insuranceAmount = Math.floor(mainBet / 2);
        if (insuranceAmount > 0 && banks.human >= insuranceAmount) {
          playChipSound();
          setBanks((prev) => ({ ...prev, human: prev.human - insuranceAmount }));
          setInsuranceBet(insuranceAmount);
        }
      }

      setInsuranceOffered(false);

      if (pendingPeekSettlement) {
        const { roundSeats, nextHands, nextStatuses, nextSeatBets, nextDealerHand } = pendingPeekSettlement;
        playDealerAndSettle(roundSeats, nextHands, nextStatuses, nextSeatBets, nextDealerHand, insuranceAmount);
      } else {
        setStatus(takeInsurance ? 'Insurance placed.' : 'Insurance declined.');
      }
    },
    [banks.human, insuranceOffered, pendingPeekSettlement, playDealerAndSettle, seatBets.human]
  );

  // Step-by-step CPU turn execution with pacing
  const runCpuStep = useCallback(
    (seatId) => {
      const behavior = seatConfigs[seatId].strategy;
      const currentHands = seatHands[seatId] || [];
      const currentStatuses = seatStatuses[seatId] || [];
      const currentBets = seatBets[seatId] || [];
      let seatBank = banks[seatId];

      const handIdx = currentStatuses.findIndex((s) => s === 'playing');
      if (handIdx === -1) {
        setTurnQueue((prev) => prev.slice(1));
        setStatus(`${seatName(seatId)} finished turn.`);
        return;
      }

      const hand = currentHands[handIdx];
      const bet = currentBets[handIdx] || 0;
      const isSplitHand = currentHands.length > 1;

      const action = chooseCpuAction({
        behavior,
        hand,
        dealerUpCard,
        bank: seatBank,
        bet,
        handCount: currentHands.length,
        isSplitHand,
        rules: tableRules,
        context: { trueCount }
      });

      const isAcePair = canSplit(hand) && getCardRank(hand[0]) === 'A' && getCardRank(hand[1]) === 'A';
      const canResplitAces = tableRules.allowResplitAces || !isAcePair || currentHands.length === 1;

      if (
        action === 'split' &&
        canSplit(hand) &&
        seatBank >= bet &&
        currentHands.length < tableRules.maxSplitHands &&
        canResplitAces
      ) {
        triggerBanter(seatId, 'action_split');
        playChipSound();
        const firstHand = [hand[0], drawTrackedCard()];
        const secondHand = [hand[1], drawTrackedCard()];
        const nextHands = [...currentHands];
        nextHands.splice(handIdx, 1, firstHand, secondHand);

        const nextBets = [...currentBets];
        nextBets.splice(handIdx, 1, bet, bet);

        const nextStatuses = [...currentStatuses];
        if (tableRules.splitAcesOneCardOnly && isAcePair) {
          nextStatuses.splice(handIdx, 1, 'stood', 'stood');
        } else {
          nextStatuses.splice(handIdx, 1, 'playing', 'playing');
        }

        seatBank -= bet;
        setSeatHands((prev) => ({ ...prev, [seatId]: nextHands }));
        setSeatStatuses((prev) => ({ ...prev, [seatId]: nextStatuses }));
        setSeatBets((prev) => ({ ...prev, [seatId]: nextBets }));
        setBanks((prev) => ({ ...prev, [seatId]: seatBank }));
        setStatus(`${seatName(seatId)} splits pair.`);
        return;
      }

      const canDoubleThisHand = canDoubleDown(hand) && (!isSplitHand || tableRules.doubleAfterSplit);
      if (action === 'double' && canDoubleThisHand && seatBank >= bet) {
        triggerBanter(seatId, 'action_double');
        playChipSound();
        seatBank -= bet;
        const nextBets = [...currentBets];
        nextBets[handIdx] = bet * 2;

        const nextHands = currentHands.map((h, i) => (i === handIdx ? [...h, drawTrackedCard()] : [...h]));
        const nextTotal = calculateHandValue(nextHands[handIdx]);

        const nextStatuses = [...currentStatuses];
        if (nextTotal > 21) {
          nextStatuses[handIdx] = 'busted';
          playBustSound();
          setStatus(`${seatName(seatId)} doubled down and busted with ${nextTotal}.`);
        } else {
          nextStatuses[handIdx] = 'stood';
          setStatus(`${seatName(seatId)} doubled down and stood with ${nextTotal}.`);
        }

        setSeatHands((prev) => ({ ...prev, [seatId]: nextHands }));
        setSeatStatuses((prev) => ({ ...prev, [seatId]: nextStatuses }));
        setSeatBets((prev) => ({ ...prev, [seatId]: nextBets }));
        setBanks((prev) => ({ ...prev, [seatId]: seatBank }));
        return;
      }

      if (action === 'hit') {
        triggerBanter(seatId, 'action_hit');
        const nextHands = currentHands.map((h, i) => (i === handIdx ? [...h, drawTrackedCard()] : [...h]));
        const nextTotal = calculateHandValue(nextHands[handIdx]);

        const nextStatuses = [...currentStatuses];
        if (nextTotal > 21) {
          nextStatuses[handIdx] = 'busted';
          playBustSound();
          setStatus(`${seatName(seatId)} hits and busts with ${nextTotal}.`);
        } else if (nextTotal === 21) {
          nextStatuses[handIdx] = 'stood';
          setStatus(`${seatName(seatId)} hits to 21 and stands.`);
        } else {
          setStatus(`${seatName(seatId)} hits.`);
        }

        setSeatHands((prev) => ({ ...prev, [seatId]: nextHands }));
        setSeatStatuses((prev) => ({ ...prev, [seatId]: nextStatuses }));
        return;
      }

      // Stand
      triggerBanter(seatId, 'action_stand');
      const nextStatuses = [...currentStatuses];
      nextStatuses[handIdx] = 'stood';
      const total = calculateHandValue(hand);
      setSeatStatuses((prev) => ({ ...prev, [seatId]: nextStatuses }));
      setStatus(`${seatName(seatId)} stands with ${total}.`);
    },
    [
      banks,
      dealerUpCard,
      drawTrackedCard,
      seatBets,
      seatConfigs,
      seatHands,
      seatStatuses,
      tableRules,
      triggerBanter,
      trueCount
    ]
  );

  const updateTableRule = useCallback((ruleKey, value) => {
    setTableRules((prev) => ({ ...prev, [ruleKey]: value }));
  }, []);

  const stepDelay =
    process.env.NODE_ENV === 'test' ? 10 : gameSpeed === 'fast' ? 180 : gameSpeed === 'instant' ? 0 : 550;

  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN) return;
    if (insuranceOffered || pendingPeekSettlement) return;

    if (!activeSeatId) {
      const roundSeats = getRoundSeats(seatBets);
      if (roundSeats.length > 0) {
        playDealerAndSettle(roundSeats, seatHands, seatStatuses, seatBets);
      }
      return;
    }

    if (activeSeatId === HUMAN_SEAT) return;

    const timer = setTimeout(() => {
      runCpuStep(activeSeatId);
    }, stepDelay);

    return () => clearTimeout(timer);
  }, [
    activeSeatId,
    gameState,
    getRoundSeats,
    insuranceOffered,
    pendingPeekSettlement,
    playDealerAndSettle,
    runCpuStep,
    seatBets,
    seatHands,
    seatStatuses,
    stepDelay
  ]);

  const resetGame = useCallback(() => {
    setBanks(buildSeatScalar(STARTING_BANK));
    setSeatBets(buildSeatLists());
    setSeatHands(buildSeatLists());
    setSeatStatuses(buildSeatLists());
    setDealerHand([]);
    setTurnQueue([]);
    setPendingHumanBet(0);
    setShowDealerCard(false);
    setStatus('Game reset. Place your bet.');
    setGameState(GAME_STATES.BETTING);
    setTableRules(DEFAULT_TABLE_RULES);
    setInsuranceOffered(false);
    setInsuranceBet(0);
    setPendingPeekSettlement(null);
    setRunningCount(0);
    setCardsSeen(0);
    setSpeechBubbles({});
    resetDeck();
  }, [resetDeck]);

  const newRound = useCallback(() => {
    setSeatBets(buildSeatLists());
    setSeatHands(buildSeatLists());
    setSeatStatuses(buildSeatLists());
    setDealerHand([]);
    setTurnQueue([]);
    setPendingHumanBet(0);
    setShowDealerCard(false);
    setStatus('Place your bet.');
    setGameState(GAME_STATES.BETTING);
    setInsuranceOffered(false);
    setInsuranceBet(0);
    setPendingPeekSettlement(null);
    setSpeechBubbles({});
  }, []);

  const toggleSound = () => {
    const next = !audioMuted;
    setMuted(next);
    setAudioMuted(next);
  };

  const humanStatuses = useMemo(() => seatStatuses.human || [], [seatStatuses.human]);
  const humanPlayingIdx = humanStatuses.findIndex((handStatus) => handStatus === 'playing');
  const canHitHuman =
    gameState === GAME_STATES.PLAYER_TURN && activeSeatId === HUMAN_SEAT && humanPlayingIdx !== -1 && !insuranceOffered;
  const canStandHuman = canHitHuman;

  const canDoubleHuman = useMemo(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT || insuranceOffered) return false;
    const humanHands = seatHands.human || [];
    const handIdx = humanStatuses.findIndex((s) => s === 'playing');
    if (handIdx === -1) return false;

    const hand = humanHands[handIdx];
    const bet = (seatBets.human || [])[handIdx] || 0;
    const isSplit = humanHands.length > 1;
    const doubleAllowed = !isSplit || tableRules.doubleAfterSplit;
    return canDoubleDown(hand) && doubleAllowed && banks.human >= bet;
  }, [
    activeSeatId,
    banks.human,
    gameState,
    humanStatuses,
    insuranceOffered,
    seatBets.human,
    seatHands.human,
    tableRules.doubleAfterSplit
  ]);

  const canSplitHuman = useMemo(() => {
    if (gameState !== GAME_STATES.PLAYER_TURN || activeSeatId !== HUMAN_SEAT || insuranceOffered) return false;
    const humanHands = seatHands.human || [];
    const handIdx = humanStatuses.findIndex((s) => s === 'playing');
    if (handIdx === -1) return false;

    const hand = humanHands[handIdx];
    const bet = (seatBets.human || [])[handIdx] || 0;
    if (!canSplit(hand) || banks.human < bet || humanHands.length >= tableRules.maxSplitHands) return false;

    const isAcePair = getCardRank(hand[0]) === 'A' && getCardRank(hand[1]) === 'A';
    if (isAcePair && !tableRules.allowResplitAces && humanHands.length > 1) return false;

    return true;
  }, [
    activeSeatId,
    banks.human,
    gameState,
    humanStatuses,
    insuranceOffered,
    seatBets.human,
    seatHands.human,
    tableRules.allowResplitAces,
    tableRules.maxSplitHands
  ]);

  const canSurrenderHuman =
    gameState === GAME_STATES.PLAYER_TURN &&
    activeSeatId === HUMAN_SEAT &&
    humanPlayingIdx === 0 &&
    (seatHands.human || []).length === 1 &&
    (seatHands.human[0] || []).length === 2 &&
    tableRules.allowLateSurrender &&
    !insuranceOffered;

  const seatPanels = useMemo(() => {
    return SEAT_ORDER.filter((seatId) => seatId === HUMAN_SEAT || seatConfigs[seatId]?.enabled).map((seatId) => ({
      id: seatId,
      label: seatName(seatId)
    }));
  }, [seatConfigs]);

  return (
    <div className="App min-h-screen p-3 sm:p-6 lg:p-8 pt-4 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Top Header Bar */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-3 mb-2 px-2">
        <div className="flex items-center gap-3">
          <span className="text-white text-3xl sm:text-5xl font-extrabold tracking-widest text-shadow-lg">
            BLACKJACK
          </span>
          <span className="text-yellow-400 text-xs sm:text-sm font-semibold tracking-wide border-l border-yellow-500/40 pl-3">
            Table Simulator
          </span>
        </div>

        {/* Quick Utilities: Speed, Audio, Rules, Lineup */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {canConfigureSeats && (
            <button
              onClick={() => setShowLaunchConfig(true)}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              Change Lineup
            </button>
          )}

          <button
            onClick={() => setShowRulesPanel(!showRulesPanel)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-3 py-1.5 rounded-lg border border-white/10"
          >
            Table Rules {showRulesPanel ? '▲' : '▼'}
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-gray-900 border border-white/10 rounded-lg p-0.5">
            {['normal', 'fast', 'instant'].map((speed) => (
              <button
                key={speed}
                onClick={() => setGameSpeed(speed)}
                className={`px-2 py-1 rounded capitalize font-medium ${
                  gameSpeed === speed ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {speed}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-lg font-semibold border ${
              audioMuted
                ? 'bg-gray-800 text-gray-400 border-gray-700'
                : 'bg-green-800/80 text-green-200 border-green-600'
            }`}
          >
            Sound: {audioMuted ? 'OFF' : 'ON'}
          </button>
        </div>
      </div>

      {/* Rules Drawer */}
      {showRulesPanel && (
        <div className="w-full max-w-4xl bg-gray-950/90 border border-green-700/50 rounded-xl p-4 mb-4 shadow-xl text-xs text-gray-200">
          <div className="text-white text-sm font-bold text-center mb-2">Vegas Table Rules</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tableRules.dealerHitsSoft17}
                disabled={!canConfigureSeats}
                onChange={(e) => updateTableRule('dealerHitsSoft17', e.target.checked)}
              />
              Dealer hits soft 17 (H17)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tableRules.doubleAfterSplit}
                disabled={!canConfigureSeats}
                onChange={(e) => updateTableRule('doubleAfterSplit', e.target.checked)}
              />
              Double after split (DAS)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tableRules.allowResplitAces}
                disabled={!canConfigureSeats}
                onChange={(e) => updateTableRule('allowResplitAces', e.target.checked)}
              />
              Allow resplit aces
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tableRules.splitAcesOneCardOnly}
                disabled={!canConfigureSeats}
                onChange={(e) => updateTableRule('splitAcesOneCardOnly', e.target.checked)}
              />
              Split aces: 1 card only
            </label>
          </div>
        </div>
      )}

      {/* Dealer Felt Area */}
      <div className="w-full max-w-4xl mb-4 flex flex-col items-center relative">
        <Hand
          cards={dealerHand}
          showAllCards={showDealerCard}
          label="Dealer"
          showValue={showDealerCard}
          alwaysShowValue={true}
          value={dealerScore}
          showCountTags={showCardTags}
        />
      </div>

      {/* Felt Centerpiece Inscription */}
      <div className="text-center text-yellow-500/60 uppercase tracking-widest text-[11px] sm:text-xs font-black select-none mb-3">
        Blackjack Pays 3 to 2 • Dealer Must Draw to 16 and Stand on All 17s • Insurance Pays 2 to 1
      </div>

      {/* CPU Setup Summary Banner */}
      <div className="w-full max-w-5xl bg-transparent rounded-lg p-2 mb-2">
        <div className="text-white text-sm text-center mb-0.5">CPU Setup</div>
        <div className="text-gray-300 text-xs sm:text-sm text-center">
          {CPU_SEATS
            .filter((seatId) => seatConfigs[seatId].enabled)
            .map((seatId) => `${seatName(seatId)} (${CPU_BEHAVIORS.find((option) => option.id === seatConfigs[seatId].strategy)?.label})`)
            .join(' | ') || 'No CPUs selected'}
        </div>
        <div className="text-[11px] text-gray-400 mt-1 text-center">
          CPU bets: Rookie {getCpuDisplayBetLabel('rookie')}, Basic {getCpuDisplayBetLabel('basic')}, Risk {getCpuDisplayBetLabel('risk')}, Counter {getCpuDisplayBetLabel('counter')}.
        </div>
      </div>

      {/* Status Banner */}
      <div className="text-white text-base sm:text-xl mb-4 px-6 py-2.5 rounded-xl min-w-[280px] max-w-2xl text-center bg-green-950/70 backdrop-blur-md border border-green-600/50 shadow-lg">
        {status}
      </div>

      {/* Seats Grid */}
      <div className="w-full max-w-7xl px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 justify-items-center items-end mb-4 min-h-[280px]">
        {seatPanels.map(({ id, label }) => {
          const isCpuSeat = id !== HUMAN_SEAT;
          const char = getCharacter(id);
          const hands = seatHands[id] || [];
          const statuses = seatStatuses[id] || [];
          const bets = seatBets[id] || [];
          const isActive = activeSeatId === id && gameState === GAME_STATES.PLAYER_TURN;
          const seatSummaryStatus = summarizeSeatResult(statuses);
          const bubble = speechBubbles[id];

          let seatGlow = 'border-white/15 bg-black/40';
          if (isActive) seatGlow = 'shadow-[0_0_25px_rgba(250,204,21,0.7)] ring-2 ring-yellow-400 bg-yellow-950/20';
          else if (seatSummaryStatus === 'won')
            seatGlow = 'shadow-[0_0_20px_rgba(34,197,94,0.6)] ring-2 ring-green-500 bg-green-950/20';
          else if (seatSummaryStatus === 'lost' || seatSummaryStatus === 'busted')
            seatGlow = 'shadow-[0_0_20px_rgba(239,68,68,0.6)] ring-2 ring-red-500 bg-red-950/20';
          else if (seatSummaryStatus === 'push')
            seatGlow = 'shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-2 ring-blue-500 bg-blue-950/20';

          return (
            <div
              key={id}
              className={`w-full rounded-2xl p-3 sm:p-4 backdrop-blur-md border ${seatGlow} transition-all duration-300 relative flex flex-col justify-between`}
            >
              {/* Animated Speech Bubble */}
              {bubble && <SpeechBubble text={bubble} characterId={id} />}

              {/* Active Action Badge */}
              {isActive && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg animate-bounce">
                  ACTION
                </div>
              )}

              {/* Header: Avatar, Name, Title, Strategy */}
              <div className="flex items-center gap-2.5 mb-2 border-b border-white/10 pb-2">
                <CharacterAvatar characterId={id} className="w-9 h-9 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm sm:text-base font-bold truncate flex items-center gap-1.5">
                    <span>{label}</span>
                    <span className="text-[10px] font-normal text-yellow-400 truncate">"{char.nickname}"</span>
                  </div>
                  <div className="text-[10px] text-gray-300 truncate">
                    {isCpuSeat
                      ? CPU_BEHAVIORS.find((option) => option.id === seatConfigs[id].strategy)?.label
                      : 'Player'}
                  </div>
                </div>
              </div>

              {/* Hands on Felt */}
              {hands.length === 0 ? (
                <div className="text-gray-400 text-xs text-center py-8 opacity-60 italic">Waiting...</div>
              ) : (
                <div className="flex flex-col gap-2 my-1">
                  {hands.map((hand, handIdx) => (
                    <div key={`${id}-hand-${handIdx}`} className="rounded-xl bg-black/30 p-2 relative">
                      <Hand
                        cards={hand}
                        showAllCards={true}
                        showValue={hand.length > 0}
                        value={calculateHandValue(hand)}
                        label={hands.length > 1 ? `Hand ${handIdx + 1}` : ''}
                        showCountTags={showCardTags}
                      />
                      <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-1.5 text-xs">
                        <span className="text-yellow-300 font-semibold">Bet: ${bets[handIdx] || 0}</span>
                        <span
                          className={`font-bold uppercase tracking-wider text-[11px] ${
                            statuses[handIdx] === 'busted' ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {statuses[handIdx] || 'idle'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bank Footer */}
              <div className="flex justify-between items-center mt-2 border-t border-white/15 pt-2">
                <span className="text-gray-400 text-xs">Bank:</span>
                <span className="text-green-400 text-sm sm:text-base font-extrabold">${banks[id]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Counting Training Suite */}
      <CardCountingTrainer
        runningCount={runningCount}
        trueCount={trueCount}
        cardsSeen={cardsSeen}
        decksRemaining={decksRemaining}
        cardsRemaining={cardsRemaining}
        showCardTags={showCardTags}
        onToggleCardTags={() => setShowCardTags(!showCardTags)}
        quizMode={quizMode}
        onToggleQuizMode={() => setQuizMode(!quizMode)}
      />

      {/* Game Action Controls */}
      <div className="my-4 flex flex-col items-center w-full max-w-2xl mx-auto">
        <GameControls
          onDeal={initialDeal}
          onHit={hitHuman}
          onStand={standHuman}
          onDoubleDown={doubleHuman}
          onSplit={splitHuman}
          onReset={resetGame}
          canDeal={!showLaunchConfig && gameState === GAME_STATES.BETTING && pendingHumanBet > 0}
          canHit={canHitHuman}
          canStand={canStandHuman}
          canDouble={canDoubleHuman}
          canSplit={canSplitHuman}
          gameOver={gameState === GAME_STATES.GAME_OVER}
        />

        {canSurrenderHuman && (
          <button
            onClick={surrenderHuman}
            className="mt-3 w-full max-w-xs bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-6 text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Surrender
          </button>
        )}

        {insuranceOffered && (
          <div className="mt-3 flex gap-3 justify-center">
            <button
              onClick={() => resolveInsuranceDecision(true)}
              className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2.5 px-5 text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Take Insurance
            </button>
            <button
              onClick={() => resolveInsuranceDecision(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-5 text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              No Insurance
            </button>
          </div>
        )}
      </div>

      {/* Human Betting Chip Controls */}
      {gameState === GAME_STATES.BETTING && !showLaunchConfig && (
        <div className="mb-4 text-center">
          <div className="text-white text-lg font-semibold mb-3 tracking-wide">Place Your Bet</div>
          <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
            {BET_DENOMINATIONS.map((amount) => (
              <ChipButton
                key={amount}
                value={amount}
                onClick={() => {
                  playChipSound();
                  setPendingHumanBet(amount);
                }}
                disabled={showLaunchConfig || banks.human < amount}
              />
            ))}
          </div>
          <div className="text-yellow-400 text-base font-medium mt-3">Selected bet: ${pendingHumanBet}</div>
        </div>
      )}

      {/* Banks Summary Bar */}
      <div className="text-white text-xs sm:text-sm font-semibold bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-xl text-center border border-white/10 mt-2 mb-4">
        Banks: {seatPanels.map(({ id }) => `${seatName(id)} $${banks[id]}`).join(' | ')}
      </div>

      {insuranceBet > 0 && gameState !== GAME_STATES.GAME_OVER && (
        <div className="text-cyan-300 text-sm font-semibold mb-3">Insurance bet: ${insuranceBet}</div>
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <button
          onClick={newRound}
          className="my-3 bg-green-600 hover:bg-green-500 text-white font-extrabold py-3 px-8 text-lg rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-200 transform hover:scale-105"
        >
          New Round
        </button>
      )}

      {/* Table Talk Collapsible Banter Log */}
      <TableTalkLog
        messages={tableMessages}
        isOpen={showTableTalk}
        onToggle={() => setShowTableTalk(!showTableTalk)}
        onClear={() => setTableMessages([])}
      />

      {/* CPU Lineup Setup Modal */}
      {showLaunchConfig && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gray-900 border border-green-600/60 rounded-2xl p-6 shadow-2xl">
            <div className="text-white text-2xl font-black text-center mb-1">CPU Lineup Setup</div>
            <div className="text-gray-300 text-xs sm:text-sm text-center mb-4">Select CPU count and identities</div>

            <div className="flex gap-2 justify-center mb-4">
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setLaunchCpuCount(count)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    launchCpuCount === count
                      ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {launchCpuCount > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {CPU_SEATS.map((seatId) => {
                  const selected = selectedCpuIds.includes(seatId);
                  const disabled = !selected && selectedCpuIds.length >= launchCpuCount;
                  const char = CHARACTERS[seatId];
                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleCpuIdentity(seatId)}
                      disabled={disabled}
                      className={`text-left rounded-xl p-3 flex items-start gap-3 transition-all border ${
                        selected
                          ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400 text-white shadow-lg'
                          : 'bg-gray-800/80 border-white/5 text-gray-200 hover:bg-gray-800'
                      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <CharacterAvatar characterId={seatId} className="w-10 h-10 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-white flex items-center justify-between">
                          <span>{seatName(seatId)}</span>
                          <span className="text-[10px] text-yellow-400 font-semibold">"{char?.nickname}"</span>
                        </div>
                        <div className="text-xs text-indigo-300 font-medium">
                          {CPU_BEHAVIORS.find((option) => option.id === DEFAULT_IDENTITY_STRATEGY[seatId])?.label}
                        </div>
                        <div className="text-[11px] text-gray-400 leading-snug mt-1">{char?.description}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Betting: {char?.bettingStyle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={applyLaunchConfig}
              disabled={selectedCpuIds.length !== launchCpuCount}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold py-3 rounded-xl transition-all shadow-lg"
            >
              Start Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blackjack;
