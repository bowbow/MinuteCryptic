export const clueTypes = [
  'anagram',
  'charade',
  'container',
  'deletion',
  'reversal',
  'hidden-word',
  'double-definition',
  'homophone',
  'cryptic-definition',
  'mixed',
] as const;

export type ClueType = (typeof clueTypes)[number];

export type HintDetail = {
  text: string;
  explanation: string;
};

export type CrypticClue = {
  id: string;
  clue: string;
  answer: string;
  enumeration: string;
  type: ClueType;
  definition: string;
  indicators: HintDetail[];
  fodder: HintDetail[];
  wordplayHint: string;
  fullParse: string;
  validation?:
    | { kind: 'whole-anagram'; source: string }
    | { kind: 'hidden'; source: string; reversed?: boolean };
};
