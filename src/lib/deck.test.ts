import { describe, expect, it } from 'vitest';
import { advanceDeck, createDeck } from './deck';

describe('clue deck', () => {
  it('visits every clue once before starting another cycle', () => {
    const ids = ['a', 'b', 'c', 'd'];
    let state = createDeck(ids, () => 0.42);
    const visited = [state.order[state.index]];
    for (let index = 1; index < ids.length; index += 1) {
      state = advanceDeck(state, ids, () => 0.42);
      visited.push(state.order[state.index]);
    }
    expect(new Set(visited)).toEqual(new Set(ids));
    expect(visited).toHaveLength(ids.length);
  });

  it('does not repeat the rollover clue immediately', () => {
    const ids = ['a', 'b', 'c'];
    const finalState = { order: ['a', 'b', 'c'], index: 2 };
    const next = advanceDeck(finalState, ids, () => 0.999);
    expect(next.index).toBe(0);
    expect(next.order[0]).not.toBe('c');
    expect(new Set(next.order)).toEqual(new Set(ids));
  });
});
