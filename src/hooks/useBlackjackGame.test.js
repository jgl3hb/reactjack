import {
  calculateHandValue,
  isBlackjack,
  canSplit,
  canDoubleDown,
  shouldDealerHit,
  determineWinner,
  getCardValue,
  getCardRank
} from './useBlackjackGame';

describe('blackjack rules', () => {
  test('handles aces correctly when calculating hand value', () => {
    expect(calculateHandValue(['hA', 's09'])).toBe(20);
    expect(calculateHandValue(['hA', 's09', 'd09'])).toBe(19);
    expect(calculateHandValue(['hA', 'sA', 'd09'])).toBe(21);
  });

  test('detects natural blackjack', () => {
    expect(isBlackjack(['hA', 'sK'])).toBe(true);
    expect(isBlackjack(['hA', 's09', 'dA'])).toBe(false);
    expect(isBlackjack(['h10', 'sK'])).toBe(false);
  });

  test('supports split and double eligibility checks', () => {
    expect(canSplit(['h08', 's08'])).toBe(true);
    expect(canSplit(['h08', 's09'])).toBe(false);
    expect(canDoubleDown(['h06', 's05'])).toBe(true);
    expect(canDoubleDown(['h06', 's05', 'd02'])).toBe(false);
  });

  test('uses S17 dealer behavior by default', () => {
    expect(shouldDealerHit(16)).toBe(true);
    expect(shouldDealerHit(17)).toBe(false);
  });

  test('supports H17 table rule', () => {
    expect(shouldDealerHit(17, ['hA', 's06'], { dealerHitsSoft17: true })).toBe(true);
    expect(shouldDealerHit(17, ['h10', 's07'], { dealerHitsSoft17: true })).toBe(false);
  });

  test('pays natural blackjack at 3:2', () => {
    const result = determineWinner(21, 20, ['hA', 'sK'], ['d10', 'cQ'], 100, {
      playerNaturalBlackjack: true,
      dealerNaturalBlackjack: false
    });

    expect(result.status).toBe('win');
    expect(result.payout).toBe(250);
  });

  test('supports configurable blackjack payout', () => {
    const result = determineWinner(21, 20, ['hA', 'sK'], ['d10', 'cQ'], 100, {
      playerNaturalBlackjack: true,
      dealerNaturalBlackjack: false,
      blackjackPayoutMultiplier: 1.2
    });
    expect(result.payout).toBeCloseTo(220, 5);
  });

  test('does not pay split 21 as natural blackjack', () => {
    const result = determineWinner(21, 20, ['hA', 'sK'], ['d10', 'cQ'], 100, {
      playerNaturalBlackjack: false,
      dealerNaturalBlackjack: false
    });

    expect(result.status).toBe('win');
    expect(result.payout).toBe(200);
  });

  test('dealer natural blackjack beats non-natural player 21', () => {
    const result = determineWinner(21, 21, ['h10', 's06', 'd05'], ['dA', 'cK'], 100, {
      playerNaturalBlackjack: false,
      dealerNaturalBlackjack: true
    });

    expect(result.status).toBe('loss');
    expect(result.payout).toBe(0);
  });

  test('is null-safe for malformed cards', () => {
    expect(getCardValue(null)).toBe(0);
    expect(getCardRank(null)).toBe('');
    expect(calculateHandValue(['h10', null, 's05'])).toBe(15);
  });
});
