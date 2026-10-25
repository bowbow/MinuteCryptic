import { describe, expect, it } from 'vitest';
import { emptyReveals, restoreState, serializeState, STORAGE_VERSION, type PersistedState } from './persistence';

const state: PersistedState = {
  version: STORAGE_VERSION,
  started: true,
  deck: { order: ['a', 'b'], index: 1 },
  reveals: { ...emptyReveals(), indicators: true, letters: [0, 2] },
};

describe('persisted state', () => {
  it('round-trips valid state', () => {
    expect(restoreState(serializeState(state), ['a', 'b'])).toEqual(state);
  });

  it('rejects a version mismatch', () => {
    expect(restoreState(JSON.stringify({ ...state, version: STORAGE_VERSION + 1 }), ['a', 'b'])).toBeNull();
  });

  it('rejects an incompatible clue order', () => {
    expect(restoreState(serializeState(state), ['a', 'b', 'c'])).toBeNull();
  });

  it('rejects malformed JSON', () => {
    expect(restoreState('{nope', ['a', 'b'])).toBeNull();
  });
});
