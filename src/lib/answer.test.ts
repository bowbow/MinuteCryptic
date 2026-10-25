import { describe, expect, it } from 'vitest';
import { answerGroups, maskAnswer, normalizeLetters, parseEnumeration, revealNextLetter } from './answer';

describe('answer utilities', () => {
  it('parses valid enumerations and rejects malformed values', () => {
    expect(parseEnumeration('8')).toEqual([8]);
    expect(parseEnumeration('3,5')).toEqual([3, 5]);
    expect(parseEnumeration('4-4')).toEqual([4, 4]);
    expect(parseEnumeration('0')).toBeNull();
    expect(parseEnumeration('three')).toBeNull();
  });

  it('normalizes answer letters and reports word groups', () => {
    expect(normalizeLetters("rock-'n'-roll")).toBe('ROCKNROLL');
    expect(answerGroups('ALARM CLOCK')).toEqual([5, 5]);
    expect(answerGroups('MOTHER-IN-LAW')).toEqual([6, 2, 3]);
  });

  it('masks letters while preserving spaces and punctuation', () => {
    expect(maskAnswer('EGG TIMER', new Set())).toBe('___ _____');
    expect(maskAnswer('EGG TIMER', new Set([0, 4]))).toBe('E__ T____');
    expect(maskAnswer('X-RAY', new Set([0, 2]))).toBe('X-R__');
  });

  it('reveals a new position without hiding or duplicating earlier positions', () => {
    let revealed: number[] = [];
    for (let count = 1; count <= 8; count += 1) {
      const previous = [...revealed];
      revealed = revealNextLetter('EGG TIMER', revealed, () => 0);
      expect(revealed).toHaveLength(count);
      expect(new Set(revealed).size).toBe(count);
      expect(revealed).toEqual(expect.arrayContaining(previous));
      expect(revealed).not.toContain(3);
    }
    expect(revealNextLetter('EGG TIMER', revealed, () => 0.5)).toEqual(revealed);
  });
});
