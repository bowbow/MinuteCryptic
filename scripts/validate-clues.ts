import { clues } from '../src/data/clues';
import { answerGroups, normalizeLetters, parseEnumeration } from '../src/lib/answer';
import { clueTypes } from '../src/types';

const errors: string[] = [];
const ids = new Set<string>();
const clueTexts = new Set<string>();
const answers = new Set<string>();
const allowedTypes = new Set<string>(clueTypes);

const fail = (id: string, message: string) => errors.push(`${id || '<missing id>'}: ${message}`);

for (const clue of clues) {
  if (!clue.id.trim()) fail(clue.id, 'ID must not be empty.');
  if (ids.has(clue.id)) fail(clue.id, 'ID is duplicated.');
  ids.add(clue.id);

  for (const field of ['clue', 'answer', 'enumeration', 'definition', 'wordplayHint', 'fullParse'] as const) {
    if (!clue[field].trim()) fail(clue.id, `${field} must not be empty.`);
  }

  if (!allowedTypes.has(clue.type)) fail(clue.id, `Unknown clue type “${clue.type}”.`);

  const normalizedClue = clue.clue.trim().toLocaleLowerCase();
  if (clueTexts.has(normalizedClue)) fail(clue.id, 'Clue text is duplicated.');
  clueTexts.add(normalizedClue);

  const normalizedAnswer = normalizeLetters(clue.answer);
  if (answers.has(normalizedAnswer)) fail(clue.id, `Normalized answer ${normalizedAnswer} is duplicated.`);
  answers.add(normalizedAnswer);

  const enumeration = parseEnumeration(clue.enumeration);
  if (!enumeration) {
    fail(clue.id, `Invalid enumeration “${clue.enumeration}”.`);
  } else {
    const groups = answerGroups(clue.answer);
    if (groups.join(',') !== enumeration.join(',')) {
      fail(clue.id, `Answer groups ${groups.join(',')} do not match enumeration ${enumeration.join(',')}.`);
    }
  }

  for (const [kind, values] of [['indicator', clue.indicators], ['fodder', clue.fodder]] as const) {
    values.forEach((entry, index) => {
      if (!entry.text.trim()) fail(clue.id, `${kind} ${index + 1} has empty text.`);
      if (!entry.explanation.trim()) fail(clue.id, `${kind} ${index + 1} has empty explanation.`);
    });
  }

  const hintWords: string[] = clue.wordplayHint.toUpperCase().match(/[A-Z]+/g) ?? [];
  if (hintWords.includes(normalizedAnswer)) {
    fail(clue.id, 'Wordplay hint reveals the complete normalized answer as a standalone word.');
  }

  if (clue.validation?.kind === 'whole-anagram') {
    const source = [...normalizeLetters(clue.validation.source)].sort().join('');
    const target = [...normalizedAnswer].sort().join('');
    if (source !== target) fail(clue.id, 'Whole-answer anagram fodder does not match the answer exactly.');
  }

  if (clue.validation?.kind === 'hidden') {
    const source = normalizeLetters(clue.validation.source);
    const target = clue.validation.reversed ? [...normalizedAnswer].reverse().join('') : normalizedAnswer;
    if (!source.includes(target)) fail(clue.id, `Hidden answer does not occur in “${clue.validation.source}”.`);
  }
}

if (clues.length < 100) errors.push(`library: expected at least 100 clues, found ${clues.length}.`);

if (errors.length) {
  console.error(`Clue validation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  const distribution = Object.fromEntries(clueTypes.map((type) => [type, clues.filter((clue) => clue.type === type).length]));
  console.log(`Validated ${clues.length} clues successfully.`);
  console.log('Type distribution:', distribution);
  console.log('Editorial note: automated checks verify structure, enumerations, duplicates, whole-answer anagrams, and hidden words. Surface quality, synonym fairness, abbreviations, homophones, and multi-step parses still require human review.');
}
