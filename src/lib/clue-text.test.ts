import { describe, expect, it } from 'vitest';
import { segmentClueText } from './clue-text';

describe('segmentClueText', () => {
  it('marks an exact definition phrase while preserving the clue', () => {
    const segments = segmentClueText('Quiet — listen, confused', [{ kind: 'definition', parts: ['Quiet'] }]);

    expect(segments.map((segment) => segment.text).join('')).toBe('Quiet — listen, confused');
    expect(segments.filter((segment) => segment.highlight === 'definition').map((segment) => segment.text)).toEqual(['Quiet']);
  });

  it('supports both halves of a double definition', () => {
    const segments = segmentClueText('Present flow', [{ kind: 'definition', parts: ['Present', 'flow'] }]);

    expect(segments.filter((segment) => segment.highlight === 'definition').map((segment) => segment.text)).toEqual(['Present', 'flow']);
  });

  it('assigns distinct categories to definition, fodder, and indicator text', () => {
    const segments = segmentClueText('Quiet — listen, confused', [
      { kind: 'definition', parts: ['Quiet'] },
      { kind: 'fodder', parts: ['listen'] },
      { kind: 'indicator', parts: ['confused'] },
    ]);

    expect(segments.filter((segment) => segment.highlight).map(({ text, highlight }) => ({ text, highlight }))).toEqual([
      { text: 'Quiet', highlight: 'definition' },
      { text: 'listen', highlight: 'fodder' },
      { text: 'confused', highlight: 'indicator' },
    ]);
  });
});
