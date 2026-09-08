import {
  chooseCpuAction,
  getCpuDisplayBetLabel,
  getCpuRoundBet,
  summarizeSeatResult
} from './cpuLogic';

describe('cpu logic', () => {
  test('returns fixed rookie/basic bets with bankroll cap', () => {
    expect(getCpuRoundBet('rookie', 500)).toBe(10);
    expect(getCpuRoundBet('rookie', 6)).toBe(6);
    expect(getCpuRoundBet('basic', 500)).toBe(25);
    expect(getCpuRoundBet('basic', 12)).toBe(12);
  });

  test('risk bet varies but stays in configured range and bankroll', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(getCpuRoundBet('risk', 500)).toBe(100);
    expect(getCpuRoundBet('risk', 40)).toBe(25);
    expect(getCpuRoundBet('risk', 10)).toBe(0);
    spy.mockRestore();
  });

  test('risk chooses split before other actions when legal', () => {
    const action = chooseCpuAction({
      behavior: 'risk',
      hand: ['h08', 's08'],
      dealerUpCard: 'd10',
      bank: 200,
      bet: 50,
      handCount: 1
    });
    expect(action).toBe('split');
  });

  test('risk chooses double aggressively when split unavailable', () => {
    const action = chooseCpuAction({
      behavior: 'risk',
      hand: ['h06', 's04'],
      dealerUpCard: 'd09',
      bank: 200,
      bet: 50,
      handCount: 4,
      rules: { maxSplitHands: 4 }
    });
    expect(action).toBe('double');
  });

  test('basic strategy doubles 10/11 when affordable', () => {
    const action = chooseCpuAction({
      behavior: 'basic',
      hand: ['h06', 's04'],
      dealerUpCard: 'd09',
      bank: 100,
      bet: 25,
      handCount: 1,
      isSplitHand: false,
      rules: { doubleAfterSplit: false }
    });
    expect(action).toBe('double');
  });

  test('basic strategy will not double split hand when DAS is disabled', () => {
    const action = chooseCpuAction({
      behavior: 'basic',
      hand: ['h06', 's04'],
      dealerUpCard: 'd09',
      bank: 100,
      bet: 25,
      handCount: 2,
      isSplitHand: true,
      rules: { doubleAfterSplit: false }
    });
    expect(action).toBe('hit');
  });

  test('summary helper condenses per-hand results', () => {
    expect(summarizeSeatResult(['won', 'push'])).toBe('won/push');
    expect(summarizeSeatResult(['lost', 'push'])).toBe('lost/push');
    expect(summarizeSeatResult(['won', 'lost'])).toBe('mixed');
    expect(summarizeSeatResult([])).toBe('idle');
  });

  test('display bet labels are stable', () => {
    expect(getCpuDisplayBetLabel('rookie')).toBe('$10');
    expect(getCpuDisplayBetLabel('basic')).toBe('$25');
    expect(getCpuDisplayBetLabel('risk')).toBe('$25/$50/$75/$100');
    expect(getCpuDisplayBetLabel('counter')).toBe('$25-$100 (count-based)');
  });

  test('counter bet scales with true count', () => {
    expect(getCpuRoundBet('counter', 500, { trueCount: -1 })).toBe(25);
    expect(getCpuRoundBet('counter', 500, { trueCount: 1.2 })).toBe(50);
    expect(getCpuRoundBet('counter', 500, { trueCount: 2.1 })).toBe(75);
    expect(getCpuRoundBet('counter', 500, { trueCount: 3.4 })).toBe(100);
  });
});
