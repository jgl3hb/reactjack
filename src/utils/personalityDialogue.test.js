import { getCharacterDialogue, clearDialogueHistory } from './personalityDialogue';

describe('personalityDialogue utility', () => {
  beforeEach(() => {
    clearDialogueHistory();
  });

  test('returns dialogue for Alice on action', () => {
    const line = getCharacterDialogue('alice', 'action_hit');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  test('returns dialogue for Bob on double', () => {
    const line = getCharacterDialogue('bob', 'action_double');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  test('returns dialogue for Chuck on betting', () => {
    const line = getCharacterDialogue('chuck', 'betting');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  test('returns dialogue for Jim Bob on win', () => {
    const line = getCharacterDialogue('jimbob', 'round_win');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  test('returns null for unknown character', () => {
    const line = getCharacterDialogue('random_guy', 'action_hit');
    expect(line).toBeNull();
  });

  test('provides fallback for unknown deal event', () => {
    const line = getCharacterDialogue('alice', 'deal_unknown_state');
    expect(typeof line).toBe('string');
  });
});
