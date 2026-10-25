import type { DeckState } from './deck';

export const STORAGE_KEY = 'one-cryptic-state';
export const STORAGE_VERSION = 1;

export type RevealState = {
  indicators: boolean;
  fodder: boolean;
  wordplay: boolean;
  answer: boolean;
  letters: number[];
};

export type PersistedState = {
  version: number;
  started: boolean;
  deck: DeckState | null;
  reveals: RevealState;
};

export const emptyReveals = (): RevealState => ({
  indicators: false,
  fodder: false,
  wordplay: false,
  answer: false,
  letters: [],
});

export function serializeState(state: PersistedState): string {
  return JSON.stringify(state);
}

export function restoreState(raw: string | null, validIds: readonly string[]): PersistedState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PersistedState>;
    if (value.version !== STORAGE_VERSION || typeof value.started !== 'boolean') return null;
    if (!value.deck && value.started) return null;
    if (value.deck) {
      const validSet = new Set(validIds);
      const orderSet = new Set(value.deck.order);
      if (
        !Array.isArray(value.deck.order) ||
        value.deck.order.length !== validIds.length ||
        orderSet.size !== validIds.length ||
        value.deck.order.some((id) => !validSet.has(id)) ||
        !Number.isInteger(value.deck.index) ||
        value.deck.index < 0 ||
        value.deck.index >= value.deck.order.length
      ) {
        return null;
      }
    }
    const reveal = value.reveals;
    if (
      !reveal ||
      typeof reveal.indicators !== 'boolean' ||
      typeof reveal.fodder !== 'boolean' ||
      typeof reveal.wordplay !== 'boolean' ||
      typeof reveal.answer !== 'boolean' ||
      !Array.isArray(reveal.letters) ||
      reveal.letters.some((position) => !Number.isInteger(position) || position < 0)
    ) {
      return null;
    }
    return value as PersistedState;
  } catch {
    return null;
  }
}
