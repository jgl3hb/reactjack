import { calculateHandValue, canSplit, canDoubleDown } from '../hooks/useBlackjackGame';

export const CPU_BEHAVIORS = [
  { id: 'rookie', label: 'Rookie' },
  { id: 'basic', label: 'Basic Strategy' },
  { id: 'risk', label: 'Risk Taker' },
  { id: 'counter', label: 'Card Counter' }
];

const CPU_BASE_BETS = {
  rookie: 10,
  basic: 25,
  counter: 25
};

export const RISK_BET_OPTIONS = [25, 50, 75, 100];

export const getCpuRoundBet = (behavior, bank, context = {}) => {
  if (behavior === 'risk') {
    const affordable = RISK_BET_OPTIONS.filter(amount => amount <= bank);
    if (affordable.length === 0) return 0;
    return affordable[Math.floor(Math.random() * affordable.length)];
  }

  if (behavior === 'counter') {
    const trueCount = context.trueCount ?? 0;
    const targetBet = trueCount >= 3 ? 100 : trueCount >= 2 ? 75 : trueCount >= 1 ? 50 : 25;
    return Math.min(targetBet, bank);
  }

  const baseBet = CPU_BASE_BETS[behavior] ?? CPU_BASE_BETS.basic;
  return Math.min(baseBet, bank);
};

export const getCpuDisplayBetLabel = (behavior) => {
  if (behavior === 'risk') {
    return `$${RISK_BET_OPTIONS.join('/$')}`;
  }
  if (behavior === 'counter') {
    return '$25-$100 (count-based)';
  }

  const baseBet = CPU_BASE_BETS[behavior] ?? CPU_BASE_BETS.basic;
  return `$${baseBet}`;
};

export const chooseCpuAction = ({ behavior, hand, dealerUpCard, bank, bet, handCount, isSplitHand = false, rules = {}, context = {} }) => {
  const maxSplitHands = rules.maxSplitHands ?? 4;
  const doubleAfterSplit = rules.doubleAfterSplit ?? true;
  const doubleAllowed = !isSplitHand || doubleAfterSplit;
  const total = calculateHandValue(hand);
  const dealerUp = dealerUpCard ? calculateHandValue([dealerUpCard]) : 10;

  if (behavior === 'rookie') {
    return total < 15 ? 'hit' : 'stand';
  }

  if (behavior === 'risk') {
    if (canSplit(hand) && bank >= bet && handCount < maxSplitHands) {
      return 'split';
    }

    if (canDoubleDown(hand) && bank >= bet && total >= 8 && total <= 18 && doubleAllowed) {
      return 'double';
    }

    return total < 18 ? 'hit' : 'stand';
  }

  if (behavior === 'counter') {
    const trueCount = context.trueCount ?? 0;
    if (canDoubleDown(hand) && bank >= bet && (total === 10 || total === 11) && doubleAllowed) {
      return 'double';
    }
    if (total <= 11) return 'hit';
    if (total >= 17) return 'stand';
    if (total >= 12 && total <= 16) {
      if (trueCount >= 2 && dealerUp >= 2 && dealerUp <= 6) return 'stand';
      return dealerUp >= 7 ? 'hit' : 'stand';
    }
    return 'stand';
  }

  if (canDoubleDown(hand) && bank >= bet && (total === 10 || total === 11) && doubleAllowed) {
    return 'double';
  }

  if (total <= 11) return 'hit';
  if (total >= 17) return 'stand';
  if (total >= 12 && total <= 16) {
    return dealerUp >= 7 ? 'hit' : 'stand';
  }

  return 'stand';
};

export const summarizeSeatResult = (statuses) => {
  if (!statuses || statuses.length === 0) return 'idle';
  const wins = statuses.filter(status => status === 'won').length;
  const losses = statuses.filter(status => status === 'lost').length;
  const pushes = statuses.filter(status => status === 'push').length;
  const surrendered = statuses.filter(status => status === 'surrendered').length;

  if (wins > 0 && losses === 0) return pushes > 0 ? 'won/push' : 'won';
  if (surrendered > 0 && wins === 0 && losses === 0 && pushes === 0) return 'surrendered';
  if (surrendered > 0 && wins === 0 && losses > 0) return 'lost/surrender';
  if (losses > 0 && wins === 0) return pushes > 0 ? 'lost/push' : 'lost';
  if (wins > 0 && losses > 0) return 'mixed';
  return pushes > 0 ? 'push' : statuses[0];
};
