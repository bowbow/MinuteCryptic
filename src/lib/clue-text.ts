export type ClueTextSegment = {
  text: string;
  highlight: ClueHighlight | null;
};

export type ClueHighlight = 'definition' | 'indicator' | 'fodder';

export type HighlightGroup = {
  kind: ClueHighlight;
  parts: readonly string[];
};

export function segmentClueText(clue: string, groups: readonly HighlightGroup[]): ClueTextSegment[] {
  const lowerClue = clue.toLocaleLowerCase();
  const ranges = groups
    .flatMap(({ kind, parts }) => parts.map((part) => {
      const start = lowerClue.indexOf(part.toLocaleLowerCase());
      return { start, end: start + part.length, kind };
    }))
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start);

  if (!ranges.length) return [{ text: clue, highlight: null }];

  const segments: ClueTextSegment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) {
      segments.push({ text: clue.slice(cursor, range.start), highlight: null });
    }
    segments.push({ text: clue.slice(range.start, range.end), highlight: range.kind });
    cursor = range.end;
  }
  if (cursor < clue.length) segments.push({ text: clue.slice(cursor), highlight: null });
  return segments;
}
