import { describe, expect, it } from 'vitest';
import { segmentClueText } from './clue-text';

describe('segmentClueText', () => {
  it('marks an exact definition phrase while preserving the clue', () => {
    const segments = segmentClueText('Quiet — listen, confused', ['Quiet']);

    expect(segments.map((segment) => segment.text).join('')).toBe('Quiet — listen, confused');
    expect(segments.filter((segment) => segment.isDefinition).map((segment) => segment.text)).toEqual(['Quiet']);
  });

  it('supports both halves of a double definition', () => {
    const segments = segmentClueText('Present flow', ['Present', 'flow']);

    expect(segments.filter((segment) => segment.isDefinition).map((segment) => segment.text)).toEqual(['Present', 'flow']);
  });
});
