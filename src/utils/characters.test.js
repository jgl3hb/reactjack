import { CHARACTERS, getCharacter } from './characters';

describe('characters utility', () => {
  test('defines required character profiles', () => {
    expect(CHARACTERS.alice).toBeDefined();
    expect(CHARACTERS.bob).toBeDefined();
    expect(CHARACTERS.chuck).toBeDefined();
    expect(CHARACTERS.jimbob).toBeDefined();
    expect(CHARACTERS.human).toBeDefined();
  });

  test('each character has expected metadata', () => {
    const keys = ['alice', 'bob', 'chuck', 'jimbob'];
    keys.forEach((key) => {
      const char = CHARACTERS[key];
      expect(char.name).toBeTruthy();
      expect(char.nickname).toBeTruthy();
      expect(char.strategyId).toBeTruthy();
      expect(char.description).toBeTruthy();
      expect(char.riskLevel).toBeTruthy();
      expect(char.themeColor).toBeTruthy();
    });
  });

  test('getCharacter returns default if unknown', () => {
    const fallback = getCharacter('unknown_seat');
    expect(fallback.id).toBe('human');
  });
});
