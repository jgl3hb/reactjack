// Character profiles, strategies, and styling for table participants

export const CHARACTERS = {
  alice: {
    id: 'alice',
    name: 'Alice',
    nickname: 'The Bookworm',
    strategyId: 'basic',
    strategyLabel: 'Basic Strategy',
    description: 'Disciplined and methodical. Alice follows the mathematically proven blackjack basic strategy chart on every decision.',
    riskLevel: 'Low',
    bettingStyle: 'Disciplined $25 standard bets',
    cardCountingAptitude: 'Aware of the math, but stays faithful to the basic strategy book.',
    themeColor: 'indigo',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-indigo-900/40',
    accentText: 'text-indigo-300'
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    nickname: 'The High Roller',
    strategyId: 'risk',
    strategyLabel: 'Risk Taker',
    description: 'Aggressive and thrill-seeking. Bob plays for action, splitting pairs boldly, doubling down on wide margins, and varying his bet size.',
    riskLevel: 'High',
    bettingStyle: 'Wild $25-$100 bet swings',
    cardCountingAptitude: 'Ignores card counts completely. Convinced his gut feeling beats probability.',
    themeColor: 'rose',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-900/40',
    accentText: 'text-rose-300'
  },
  chuck: {
    id: 'chuck',
    name: 'Chuck',
    nickname: 'The Counter',
    strategyId: 'counter',
    strategyLabel: 'Card Counter',
    description: 'Calm, sharp, and mathematical. Chuck tracks the shoe using Hi-Lo, ramping his wagers on high counts and deviating on stiff hands.',
    riskLevel: 'Calculated',
    bettingStyle: 'Scaled $25-$100 based on True Count',
    cardCountingAptitude: 'Expert. Tracks the running count and true count, observing shoe composition.',
    themeColor: 'emerald',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-900/40',
    accentText: 'text-emerald-300'
  },
  jimbob: {
    id: 'jimbob',
    name: 'Jim Bob',
    nickname: 'The Rookie',
    strategyId: 'rookie',
    strategyLabel: 'Rookie',
    description: 'Friendly and green. Jim Bob is brand new to the felt, hits anything under 15, stays on 15+, and sticks to minimum table bets.',
    riskLevel: 'Timid',
    bettingStyle: 'Table minimum $10 bets',
    cardCountingAptitude: 'Baffled by counting. Wondering why an Ace is worth both 1 and 11.',
    themeColor: 'amber',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-900/40',
    accentText: 'text-amber-300'
  },
  human: {
    id: 'human',
    name: 'You',
    nickname: 'The Student',
    strategyId: 'manual',
    strategyLabel: 'You (Manual Play)',
    description: 'Your seat at the blackjack table. Put your card counting skills to the test and play your way.',
    riskLevel: 'Your Choice',
    bettingStyle: 'Custom chip betting',
    cardCountingAptitude: 'In training with real-time feedback and drills.',
    themeColor: 'cyan',
    borderClass: 'border-cyan-500',
    bgClass: 'bg-cyan-900/40',
    accentText: 'text-cyan-300'
  }
};

export const getCharacter = (id) => CHARACTERS[id] || CHARACTERS.human;
