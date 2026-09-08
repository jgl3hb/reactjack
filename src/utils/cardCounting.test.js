import {
  getHiLoValue,
  getHiLoBadgeInfo,
  calculateTrueCount,
  getShoeAdvantageLevel,
  getChuckMentorAdvice
} from './cardCounting';

describe('cardCounting utility', () => {
  test('correctly evaluates Hi-Lo card values', () => {
    // 2-6 -> +1
    expect(getHiLoValue('d02')).toBe(1);
    expect(getHiLoValue('h05')).toBe(1);
    expect(getHiLoValue('c06')).toBe(1);

    // 7-9 -> 0
    expect(getHiLoValue('s07')).toBe(0);
    expect(getHiLoValue('d08')).toBe(0);
    expect(getHiLoValue('h09')).toBe(0);

    // 10, J, Q, K, A -> -1
    expect(getHiLoValue('s10')).toBe(-1);
    expect(getHiLoValue('cJ')).toBe(-1);
    expect(getHiLoValue('dQ')).toBe(-1);
    expect(getHiLoValue('hK')).toBe(-1);
    expect(getHiLoValue('sA')).toBe(-1);
  });

  test('provides correct badge info for cards', () => {
    expect(getHiLoBadgeInfo('d03').text).toBe('+1');
    expect(getHiLoBadgeInfo('d08').text).toBe('0');
    expect(getHiLoBadgeInfo('sA').text).toBe('-1');
  });

  test('calculates True Count correctly', () => {
    // 6 decks = 312 cards. If running count is +6 and 312 cards left (6 decks), TC = +1.0
    expect(calculateTrueCount(6, 312)).toBe(1);
    // If running count is +6 and 104 cards left (2 decks), TC = +3.0
    expect(calculateTrueCount(6, 104)).toBe(3);
    // Avoids division by 0 by using floor of 0.25 decks
    expect(calculateTrueCount(4, 0)).toBe(16);
  });

  test('determines shoe advantage level', () => {
    expect(getShoeAdvantageLevel(3.2).level).toBe('Extremely Favorable');
    expect(getShoeAdvantageLevel(1.5).level).toBe('Slight Advantage');
    expect(getShoeAdvantageLevel(0).level).toBe('Neutral Shoe');
    expect(getShoeAdvantageLevel(-2.5).level).toBe('Heavy House Edge');
  });

  test('generates Chuck mentor advice string', () => {
    const advice = getChuckMentorAdvice({
      runningCount: 8,
      trueCount: 3.2,
      cardsRemaining: 130
    });
    expect(advice).toContain('True Count is +3.2');
    expect(advice).toContain('prime card-counter territory');
  });
});
