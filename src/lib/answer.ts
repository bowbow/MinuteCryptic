export function normalizeLetters(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, '');
}

export function parseEnumeration(enumeration: string): number[] | null {
  if (!/^\d+(?:[ ,-]\d+)*$/.test(enumeration)) return null;
  const values = enumeration.split(/[ ,-]/).map(Number);
  return values.every((value) => Number.isInteger(value) && value > 0) ? values : null;
}

export function answerGroups(answer: string): number[] {
  return answer
    .trim()
    .split(/[\s-]+/)
    .map(normalizeLetters)
    .filter(Boolean)
    .map((part) => part.length);
}

export function letterPositions(answer: string): number[] {
  return [...answer].flatMap((character, index) => (/[A-Za-z]/.test(character) ? [index] : []));
}

export function maskAnswer(answer: string, revealed: ReadonlySet<number>): string {
  return [...answer]
    .map((character, index) => {
      if (!/[A-Za-z]/.test(character)) return character;
      return revealed.has(index) ? character.toUpperCase() : '_';
    })
    .join('');
}

export function revealNextLetter(
  answer: string,
  revealed: readonly number[],
  random: () => number = Math.random,
): number[] {
  const already = new Set(revealed);
  const available = letterPositions(answer).filter((position) => !already.has(position));
  if (available.length === 0) return [...revealed];
  const selected = available[Math.floor(random() * available.length)] ?? available[0];
  return [...revealed, selected].sort((a, b) => a - b);
}
