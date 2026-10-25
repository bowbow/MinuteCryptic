export type ClueTextSegment = {
  text: string;
  isDefinition: boolean;
};

export function segmentClueText(clue: string, definitionParts: readonly string[]): ClueTextSegment[] {
  const lowerClue = clue.toLocaleLowerCase();
  const ranges = definitionParts
    .map((part) => {
      const start = lowerClue.indexOf(part.toLocaleLowerCase());
      return { start, end: start + part.length };
    })
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start);

  if (!ranges.length) return [{ text: clue, isDefinition: false }];

  const segments: ClueTextSegment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) {
      segments.push({ text: clue.slice(cursor, range.start), isDefinition: false });
    }
    segments.push({ text: clue.slice(range.start, range.end), isDefinition: true });
    cursor = range.end;
  }
  if (cursor < clue.length) segments.push({ text: clue.slice(cursor), isDefinition: false });
  return segments;
}
