export type DeckState = {
  order: string[];
  index: number;
};

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

export function createDeck(ids: readonly string[], random: () => number = Math.random): DeckState {
  return { order: shuffle(ids, random), index: 0 };
}

export function advanceDeck(
  state: DeckState,
  ids: readonly string[],
  random: () => number = Math.random,
): DeckState {
  if (state.index < state.order.length - 1) {
    return { ...state, index: state.index + 1 };
  }

  const previous = state.order[state.index];
  const order = shuffle(ids, random);
  if (order.length > 1 && order[0] === previous) {
    [order[0], order[1]] = [order[1]!, order[0]!];
  }
  return { order, index: 0 };
}
