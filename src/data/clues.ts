import type { CrypticClue, HintDetail } from '../types';

const hint = (text: string, explanation: string): HintDetail => ({ text, explanation });

const anagram = (
  id: string,
  clue: string,
  answer: string,
  definition: string,
  source: string,
  indicator: string,
  explanation: string,
): CrypticClue => ({
  id,
  clue,
  answer,
  enumeration: String(answer.replace(/[^A-Za-z]/g, '').length),
  type: 'anagram',
  definition,
  indicators: [hint(indicator, 'Signals that the fodder letters should be rearranged.')],
  fodder: [hint(source, `These letters are rearranged to make the answer.`)],
  wordplayHint: `Rearrange the letters of ${source.toUpperCase()}.`,
  fullParse: `${definition} is made by rearranging ${source.toUpperCase()}, signalled by “${indicator}”. ${explanation}`,
  validation: { kind: 'whole-anagram', source },
});

const hidden = (
  id: string,
  clue: string,
  answer: string,
  definition: string,
  source: string,
  indicator: string,
  reversed = false,
): CrypticClue => ({
  id,
  clue,
  answer,
  enumeration: String(answer.length),
  type: 'hidden-word',
  definition,
  indicators: [hint(indicator, reversed ? 'Signals a hidden answer read backwards.' : 'Signals an answer hidden across consecutive letters.')],
  fodder: [hint(source, 'Look across these consecutive letters, ignoring spaces and punctuation.')],
  wordplayHint: `${reversed ? 'Read backwards within' : 'Look inside'} “${source}”.`,
  fullParse: `${definition} is hidden ${reversed ? 'backwards ' : ''}inside “${source}”, signalled by “${indicator}”.`,
  validation: { kind: 'hidden', source, reversed },
});

export const clues: CrypticClue[] = [
  anagram('anagram-silent', 'Quiet — listen, confused', 'SILENT', 'Quiet', 'LISTEN', 'confused', 'LISTEN becomes SILENT.'),
  anagram('anagram-garden', 'Plot danger disturbed', 'GARDEN', 'Plot', 'DANGER', 'disturbed', 'DANGER becomes GARDEN.'),
  anagram('anagram-master', 'Expert stream diverted', 'MASTER', 'Expert', 'STREAM', 'diverted', 'STREAM becomes MASTER.'),
  anagram('anagram-heart', 'Core of earth shaken', 'HEART', 'Core', 'EARTH', 'shaken', 'EARTH becomes HEART.'),
  anagram('anagram-angel', 'Messenger at angle awkwardly', 'ANGEL', 'Messenger', 'ANGLE', 'awkwardly', 'ANGLE becomes ANGEL.'),
  anagram('anagram-toner', 'Printer supply tenor playing badly', 'TONER', 'Printer supply', 'TENOR', 'badly', 'TENOR becomes TONER.'),
  anagram('anagram-teacher', 'Instructor is cheater reformed', 'TEACHER', 'Instructor', 'CHEATER', 'reformed', 'CHEATER becomes TEACHER.'),
  anagram('anagram-staple', 'Essential pleats rearranged', 'STAPLE', 'Essential', 'PLEATS', 'rearranged', 'PLEATS becomes STAPLE.'),
  anagram('anagram-rescue', 'Save secure arrangement upset', 'RESCUE', 'Save', 'SECURE', 'upset', 'SECURE becomes RESCUE.'),
  anagram('anagram-enlist', 'Recruit inlets redesigned', 'ENLIST', 'Recruit', 'INLETS', 'redesigned', 'INLETS becomes ENLIST.'),
  anagram('anagram-credit', 'Praise direct arrangement', 'CREDIT', 'Praise', 'DIRECT', 'arrangement', 'DIRECT becomes CREDIT.'),
  anagram('anagram-scare', 'Frighten races running wild', 'SCARE', 'Frighten', 'RACES', 'wild', 'RACES becomes SCARE.'),
  anagram('anagram-thing', 'Object seen in night wandering', 'THING', 'Object', 'NIGHT', 'wandering', 'NIGHT becomes THING.'),
  anagram('anagram-lemon', 'Fruit from melon sliced differently', 'LEMON', 'Fruit', 'MELON', 'differently', 'MELON becomes LEMON.'),
  anagram('anagram-below', 'Under elbow twisted', 'BELOW', 'Under', 'ELBOW', 'twisted', 'ELBOW becomes BELOW.'),
  anagram('anagram-panel', 'Board plane manoeuvred', 'PANEL', 'Board', 'PLANE', 'manoeuvred', 'PLANE becomes PANEL.'),
  anagram('anagram-state', 'Condition of taste changed', 'STATE', 'Condition', 'TASTE', 'changed', 'TASTE becomes STATE.'),
  anagram('anagram-stare', 'Look fixedly at tears flowing', 'STARE', 'Look fixedly', 'TEARS', 'flowing', 'TEARS becomes STARE.'),
  anagram('anagram-later', 'Afterwards, alert changed', 'LATER', 'Afterwards', 'ALERT', 'changed', 'ALERT becomes LATER.'),
  anagram('anagram-cheap', 'Inexpensive peach smashed', 'CHEAP', 'Inexpensive', 'PEACH', 'smashed', 'PEACH becomes CHEAP.'),

  hidden('hidden-planet', 'Wanderer concealed in airplane terminal', 'PLANET', 'Wanderer', 'airplane terminal', 'concealed in'),
  hidden('hidden-opera', 'Musical work within cooperative venture', 'OPERA', 'Musical work', 'cooperative venture', 'within'),
  hidden('hidden-river', "Watercourse found in driver's route", 'RIVER', 'Watercourse', "driver's route", 'found in'),
  hidden('hidden-elate', 'Delight concealed by travel at ease', 'ELATE', 'Delight', 'travel at ease', 'concealed by'),
  hidden('hidden-tide', 'Flow concealed when edit returns', 'TIDE', 'Flow', 'edit', 'returns', true),
  hidden('hidden-skate', 'Glide inside desk at entrance', 'SKATE', 'Glide', 'desk at entrance', 'inside'),
  hidden('hidden-unity', 'Agreement found in community talks', 'UNITY', 'Agreement', 'community talks', 'found in'),
  hidden('hidden-earth', 'Planet hidden near the horizon', 'EARTH', 'Planet', 'near the horizon', 'hidden'),
  hidden('hidden-shore', 'Coast found in fresh oregano', 'SHORE', 'Coast', 'fresh oregano', 'found in'),
  hidden('hidden-anger', 'Rage within strange result', 'ANGER', 'Rage', 'strange result', 'within'),
  hidden('hidden-stone', 'Rock found at the end of milestone', 'STONE', 'Rock', 'milestone', 'found at the end of'),
  hidden('hidden-lapse', 'Mistake uncovered in collapse report', 'LAPSE', 'Mistake', 'collapse report', 'uncovered in'),

  {
    id: 'reversal-dessert', clue: 'Sweet course stressed on return', answer: 'DESSERT', enumeration: '7', type: 'reversal', definition: 'Sweet course',
    indicators: [hint('on return', 'Signals that the preceding letters should be reversed.')], fodder: [hint('STRESSED', 'Reverse this word.')],
    wordplayHint: 'Read STRESSED from right to left.', fullParse: 'Sweet course is STRESSED reversed, signalled by “on return”.',
  },
  {
    id: 'reversal-drawer', clue: 'Cabinet part from reward returned', answer: 'DRAWER', enumeration: '6', type: 'reversal', definition: 'Cabinet part',
    indicators: [hint('returned', 'Signals a reversal.')], fodder: [hint('REWARD', 'Read this word backwards.')],
    wordplayHint: 'Read REWARD from right to left.', fullParse: 'Cabinet part is REWARD reversed, signalled by “returned”.',
  },
  {
    id: 'reversal-diaper', clue: "Baby's garment repaid backwards", answer: 'DIAPER', enumeration: '6', type: 'reversal', definition: "Baby's garment",
    indicators: [hint('backwards', 'Signals a reversal.')], fodder: [hint('REPAID', 'Read this word backwards.')],
    wordplayHint: 'Read REPAID from right to left.', fullParse: "Baby's garment is REPAID reversed, signalled by “backwards”.",
  },
  {
    id: 'reversal-live', clue: 'Exist when evil retreats', answer: 'LIVE', enumeration: '4', type: 'reversal', definition: 'Exist',
    indicators: [hint('retreats', 'Signals that the letters move backwards.')], fodder: [hint('EVIL', 'Reverse this word.')],
    wordplayHint: 'Send EVIL backwards.', fullParse: 'Exist is EVIL reversed, signalled by “retreats”.',
  },
  {
    id: 'reversal-wolf', clue: 'Predator from current turned back', answer: 'WOLF', enumeration: '4', type: 'reversal', definition: 'Predator',
    indicators: [hint('turned back', 'Signals a reversal.')], fodder: [hint('FLOW', 'Reverse this word meaning current.')],
    wordplayHint: 'Turn back a word meaning current.', fullParse: 'Predator is FLOW reversed, signalled by “turned back”.',
  },
  {
    id: 'reversal-parts', clue: 'Components of strap reversed', answer: 'PARTS', enumeration: '5', type: 'reversal', definition: 'Components',
    indicators: [hint('reversed', 'Signals a reversal.')], fodder: [hint('STRAP', 'Read this word backwards.')],
    wordplayHint: 'Reverse STRAP.', fullParse: 'Components is STRAP reversed, signalled by “reversed”.',
  },
  {
    id: 'reversal-moor', clue: 'Open land found when room turns', answer: 'MOOR', enumeration: '4', type: 'reversal', definition: 'Open land',
    indicators: [hint('turns', 'Signals a reversal.')], fodder: [hint('ROOM', 'Read this word backwards.')],
    wordplayHint: 'Turn ROOM around.', fullParse: 'Open land is ROOM reversed, signalled by “turns”.',
  },
  {
    id: 'reversal-snug', clue: 'Cosy when guns are turned around', answer: 'SNUG', enumeration: '4', type: 'reversal', definition: 'Cosy',
    indicators: [hint('turned around', 'Signals a reversal.')], fodder: [hint('GUNS', 'Reverse these letters.')],
    wordplayHint: 'Turn GUNS around.', fullParse: 'Cosy is GUNS reversed, signalled by “turned around”.',
  },
  {
    id: 'reversal-star', clue: 'Celebrity sees rats retreat', answer: 'STAR', enumeration: '4', type: 'reversal', definition: 'Celebrity',
    indicators: [hint('retreat', 'Signals a reversal.')], fodder: [hint('RATS', 'Reverse these letters.')],
    wordplayHint: 'Make RATS retreat.', fullParse: 'Celebrity is RATS reversed, signalled by “retreat”.',
  },
  {
    id: 'reversal-top', clue: 'Summit reached when pot is overturned', answer: 'TOP', enumeration: '3', type: 'reversal', definition: 'Summit',
    indicators: [hint('overturned', 'Signals a reversal.')], fodder: [hint('POT', 'Reverse these letters.')],
    wordplayHint: 'Overturn POT.', fullParse: 'Summit is POT reversed, signalled by “overturned”.',
  },

  {
    id: 'deletion-plane', clue: 'Aircraft from planet losing time', answer: 'PLANE', enumeration: '5', type: 'deletion', definition: 'Aircraft',
    indicators: [hint('losing', 'Signals removal of the following abbreviation.')], fodder: [hint('PLANET minus T', 'Remove T (time) from PLANET.')],
    wordplayHint: 'Remove the abbreviation for time from PLANET.', fullParse: 'Aircraft is PLANET without T (time), signalled by “losing”.',
  },
  {
    id: 'deletion-clove', clue: 'Spice from clover without right', answer: 'CLOVE', enumeration: '5', type: 'deletion', definition: 'Spice',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('CLOVER minus R', 'Remove R (right) from CLOVER.')],
    wordplayHint: 'Take the abbreviation for right out of CLOVER.', fullParse: 'Spice is CLOVER without R (right), signalled by “without”.',
  },
  {
    id: 'deletion-train', clue: 'Coach strain without small', answer: 'TRAIN', enumeration: '5', type: 'deletion', definition: 'Coach',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('STRAIN minus S', 'Remove S (small) from STRAIN.')],
    wordplayHint: 'Remove the abbreviation for small from STRAIN.', fullParse: 'Coach is STRAIN without S (small), signalled by “without”.',
  },
  {
    id: 'deletion-hear', clue: 'Listen to heart without time', answer: 'HEAR', enumeration: '4', type: 'deletion', definition: 'Listen to',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('HEART minus T', 'Remove T (time) from HEART.')],
    wordplayHint: 'Remove the abbreviation for time from HEART.', fullParse: 'Listen to is HEART without T (time), signalled by “without”.',
  },
  {
    id: 'deletion-cart', clue: 'Wagon chart without hard', answer: 'CART', enumeration: '4', type: 'deletion', definition: 'Wagon',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('CHART minus H', 'Remove H (hard) from CHART.')],
    wordplayHint: 'Remove the abbreviation for hard from CHART.', fullParse: 'Wagon is CHART without H (hard), signalled by “without”.',
  },
  {
    id: 'deletion-rate', clue: 'Assess crate without cold', answer: 'RATE', enumeration: '4', type: 'deletion', definition: 'Assess',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('CRATE minus C', 'Remove C (cold) from CRATE.')],
    wordplayHint: 'Remove the abbreviation for cold from CRATE.', fullParse: 'Assess is CRATE without C (cold), signalled by “without”.',
  },
  {
    id: 'deletion-late', clue: 'Behind schedule, plate without pressure', answer: 'LATE', enumeration: '4', type: 'deletion', definition: 'Behind schedule',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('PLATE minus P', 'Remove P (pressure) from PLATE.')],
    wordplayHint: 'Remove the abbreviation for pressure from PLATE.', fullParse: 'Behind schedule is PLATE without P (pressure), signalled by “without”.',
  },
  {
    id: 'deletion-rage', clue: 'Anger from grape losing pressure', answer: 'RAGE', enumeration: '4', type: 'deletion', definition: 'Anger',
    indicators: [hint('losing', 'Signals removal.')], fodder: [hint('GRAPE minus P', 'Remove P (pressure) from GRAPE.')],
    wordplayHint: 'Remove the abbreviation for pressure from GRAPE.', fullParse: 'Anger is GRAPE without P (pressure), signalled by “losing”.',
  },
  {
    id: 'deletion-scar', clue: 'Mark scare without energy', answer: 'SCAR', enumeration: '4', type: 'deletion', definition: 'Mark',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('SCARE minus E', 'Remove E (energy) from SCARE.')],
    wordplayHint: 'Remove the abbreviation for energy from SCARE.', fullParse: 'Mark is SCARE without E (energy), signalled by “without”.',
  },
  {
    id: 'deletion-tone', clue: 'Sound of stone without small', answer: 'TONE', enumeration: '4', type: 'deletion', definition: 'Sound',
    indicators: [hint('without', 'Signals removal.')], fodder: [hint('STONE minus S', 'Remove S (small) from STONE.')],
    wordplayHint: 'Remove the abbreviation for small from STONE.', fullParse: 'Sound is STONE without S (small), signalled by “without”.',
  },

  {
    id: 'charade-cupboard', clue: 'Cabinet trophy committee', answer: 'CUPBOARD', enumeration: '8', type: 'charade', definition: 'Cabinet',
    indicators: [hint('trophy committee', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('CUP + BOARD', 'A trophy followed by a committee.')],
    wordplayHint: 'Join a trophy to a committee.', fullParse: 'Cabinet is CUP (trophy) + BOARD (committee).',
  },
  {
    id: 'charade-sunset', clue: 'Evening star group', answer: 'SUNSET', enumeration: '6', type: 'charade', definition: 'Evening',
    indicators: [hint('star group', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('SUN + SET', 'A star followed by a group.')],
    wordplayHint: 'Join our star to a word for a group.', fullParse: 'Evening is SUN (star) + SET (group).',
  },
  {
    id: 'charade-bookworm', clue: 'Avid reader reserves wriggler', answer: 'BOOKWORM', enumeration: '8', type: 'charade', definition: 'Avid reader',
    indicators: [hint('reserves wriggler', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('BOOK + WORM', 'To reserve followed by a wriggler.')],
    wordplayHint: 'Join a verb meaning reserves to a wriggler.', fullParse: 'Avid reader is BOOK (reserves) + WORM (wriggler).',
  },
  {
    id: 'charade-football', clue: 'Game unit of verse with dance', answer: 'FOOTBALL', enumeration: '8', type: 'charade', definition: 'Game',
    indicators: [hint('with', 'Links two pieces that are placed together.')], fodder: [hint('FOOT + BALL', 'A metrical unit followed by a dance.')],
    wordplayHint: 'Join a metrical unit to a formal dance.', fullParse: 'Game is FOOT (metrical unit) + BALL (dance).',
  },
  {
    id: 'charade-rainbow', clue: 'Colourful arc from downpour and bend', answer: 'RAINBOW', enumeration: '7', type: 'charade', definition: 'Colourful arc',
    indicators: [hint('and', 'Links two consecutive answer pieces.')], fodder: [hint('RAIN + BOW', 'A downpour followed by a bend.')],
    wordplayHint: 'Join a downpour to a bend.', fullParse: 'Colourful arc is RAIN (downpour) + BOW (bend).',
  },
  {
    id: 'charade-bedroom', clue: 'Sleeping place plot space', answer: 'BEDROOM', enumeration: '7', type: 'charade', definition: 'Sleeping place',
    indicators: [hint('plot space', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('BED + ROOM', 'A garden plot followed by space.')],
    wordplayHint: 'Join a garden plot to a word for space.', fullParse: 'Sleeping place is BED (plot) + ROOM (space).',
  },
  {
    id: 'charade-daybreak', clue: 'Dawn period pause', answer: 'DAYBREAK', enumeration: '8', type: 'charade', definition: 'Dawn',
    indicators: [hint('period pause', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('DAY + BREAK', 'A period followed by a pause.')],
    wordplayHint: 'Join a period of time to a pause.', fullParse: 'Dawn is DAY (period) + BREAK (pause).',
  },
  {
    id: 'charade-keyboard', clue: 'Typing device important committee', answer: 'KEYBOARD', enumeration: '8', type: 'charade', definition: 'Typing device',
    indicators: [hint('important committee', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('KEY + BOARD', 'Important followed by a committee.')],
    wordplayHint: 'Join a word meaning important to a committee.', fullParse: 'Typing device is KEY (important) + BOARD (committee).',
  },
  {
    id: 'charade-headline', clue: "Newspaper title leader's queue", answer: 'HEADLINE', enumeration: '8', type: 'charade', definition: 'Newspaper title',
    indicators: [hint("leader's queue", 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('HEAD + LINE', 'A leader followed by a queue.')],
    wordplayHint: 'Join a leader to a queue.', fullParse: 'Newspaper title is HEAD (leader) + LINE (queue).',
  },
  {
    id: 'charade-moonlight', clue: 'Night glow from satellite not heavy', answer: 'MOONLIGHT', enumeration: '9', type: 'charade', definition: 'Night glow',
    indicators: [hint('satellite not heavy', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('MOON + LIGHT', 'A satellite followed by “not heavy”.')],
    wordplayHint: 'Join a natural satellite to a word meaning not heavy.', fullParse: 'Night glow is MOON (satellite) + LIGHT (not heavy).',
  },
  {
    id: 'charade-seashell', clue: 'Beach find ocean casing', answer: 'SEASHELL', enumeration: '8', type: 'charade', definition: 'Beach find',
    indicators: [hint('ocean casing', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('SEA + SHELL', 'An ocean followed by a casing.')],
    wordplayHint: 'Join an ocean to a casing.', fullParse: 'Beach find is SEA (ocean) + SHELL (casing).',
  },
  {
    id: 'charade-waterfall', clue: 'Cascade liquid drop', answer: 'WATERFALL', enumeration: '9', type: 'charade', definition: 'Cascade',
    indicators: [hint('liquid drop', 'The adjacent definitions supply consecutive pieces.')], fodder: [hint('WATER + FALL', 'A liquid followed by a drop.')],
    wordplayHint: 'Join a common liquid to a drop.', fullParse: 'Cascade is WATER (liquid) + FALL (drop).',
  },

  {
    id: 'container-spare', clue: 'Extra standard inside edges of space', answer: 'SPARE', enumeration: '5', type: 'container', definition: 'Extra',
    indicators: [hint('inside', 'Places one piece within another.')], fodder: [hint('PAR inside S…E', 'Put PAR (standard) inside the edges of SpacE.')],
    wordplayHint: 'Place a word for standard inside the outer letters of space.', fullParse: 'Extra is S + PAR (standard) + E, with PAR inside the edges of SpacE.',
  },
  {
    id: 'container-slate', clue: 'Tablet latitude inside borders of site', answer: 'SLATE', enumeration: '5', type: 'container', definition: 'Tablet',
    indicators: [hint('inside', 'Places one piece within another.')], fodder: [hint('LAT inside S…E', 'Put LAT (latitude) inside the borders of SitE.')],
    wordplayHint: 'Place the abbreviation for latitude inside the outer letters of site.', fullParse: 'Tablet is S + LAT (latitude) + E, with LAT inside the borders of SitE.',
  },
  {
    id: 'container-crown', clue: "Monarch's head quarrel within limits of celebration", answer: 'CROWN', enumeration: '5', type: 'container', definition: "Monarch's head",
    indicators: [hint('within', 'Places one piece inside another.')], fodder: [hint('ROW inside C…N', 'Put ROW (quarrel) inside the limits of CelebratioN.')],
    wordplayHint: 'Put a quarrel inside the outer letters of celebration.', fullParse: "Monarch's head is C + ROW (quarrel) + N, inside the limits of CelebratioN.",
  },
  {
    id: 'container-brand', clue: 'Label raced inside borders of board', answer: 'BRAND', enumeration: '5', type: 'container', definition: 'Label',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('RAN inside B…D', 'Put RAN (raced) inside the borders of BoarD.')],
    wordplayHint: 'Place a word meaning raced inside the outer letters of board.', fullParse: 'Label is B + RAN (raced) + D, inside the borders of BoarD.',
  },
  {
    id: 'container-grape', clue: 'Fruit knock inside limits of greenhouse', answer: 'GRAPE', enumeration: '5', type: 'container', definition: 'Fruit',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('RAP inside G…E', 'Put RAP (knock) inside the limits of GreenhousE.')],
    wordplayHint: 'Place a knock inside the outer letters of greenhouse.', fullParse: 'Fruit is G + RAP (knock) + E, inside the limits of GreenhousE.',
  },
  {
    id: 'container-flame', clue: 'Fire strike inside boundaries of furnace', answer: 'FLAME', enumeration: '5', type: 'container', definition: 'Fire',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('LAM inside F…E', 'Put LAM (strike) inside the boundaries of FurnacE.')],
    wordplayHint: 'Place an informal word meaning strike inside the outer letters of furnace.', fullParse: 'Fire is F + LAM (strike) + E, inside the boundaries of FurnacE.',
  },
  {
    id: 'container-scale', clue: 'Measure California inside borders of state', answer: 'SCALE', enumeration: '5', type: 'container', definition: 'Measure',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('CAL inside S…E', 'Put CAL (California) inside the borders of StatE.')],
    wordplayHint: 'Place an abbreviation for California inside the outer letters of state.', fullParse: 'Measure is S + CAL (California) + E, inside the borders of StatE.',
  },
  {
    id: 'container-plate', clue: 'Dish latitude inside borders of place', answer: 'PLATE', enumeration: '5', type: 'container', definition: 'Dish',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('LAT inside P…E', 'Put LAT (latitude) inside the borders of PlacE.')],
    wordplayHint: 'Place the abbreviation for latitude inside the outer letters of place.', fullParse: 'Dish is P + LAT (latitude) + E, inside the borders of PlacE.',
  },
  {
    id: 'container-speak', clue: "Talk vegetable inside sack's outer limits", answer: 'SPEAK', enumeration: '5', type: 'container', definition: 'Talk',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('PEA inside S…K', 'Put PEA (vegetable) inside the outer limits of SacK.')],
    wordplayHint: 'Place a small vegetable inside the outer letters of sack.', fullParse: 'Talk is S + PEA (vegetable) + K, inside the outer limits of SacK.',
  },
  {
    id: 'container-candy', clue: "Sweet conjunction inside city's edges", answer: 'CANDY', enumeration: '5', type: 'container', definition: 'Sweet',
    indicators: [hint('inside', 'Places one piece inside another.')], fodder: [hint('AND inside C…Y', 'Put AND (conjunction) inside the edges of CitY.')],
    wordplayHint: 'Place a conjunction inside the outer letters of city.', fullParse: 'Sweet is C + AND (conjunction) + Y, inside the edges of CitY.',
  },

  {
    id: 'double-bank', clue: "Financial institution on river's edge", answer: 'BANK', enumeration: '4', type: 'double-definition', definition: 'Financial institution / river edge',
    indicators: [], fodder: [], wordplayHint: 'Two definitions point to the same word.', fullParse: 'BANK is both a financial institution and the edge of a river.',
  },
  {
    id: 'double-bark', clue: 'Tree covering that a dog may make', answer: 'BARK', enumeration: '4', type: 'double-definition', definition: 'Tree covering / dog sound',
    indicators: [], fodder: [], wordplayHint: 'Think of a tree and a dog.', fullParse: 'BARK is both the covering of a tree and a sound made by a dog.',
  },
  {
    id: 'double-light', clue: "Illumination that's not heavy", answer: 'LIGHT', enumeration: '5', type: 'double-definition', definition: 'Illumination / not heavy',
    indicators: [], fodder: [], wordplayHint: 'One meaning is visible; the other concerns weight.', fullParse: 'LIGHT means both illumination and not heavy.',
  },
  {
    id: 'double-match', clue: 'Contest that may start a fire', answer: 'MATCH', enumeration: '5', type: 'double-definition', definition: 'Contest / fire starter',
    indicators: [], fodder: [], wordplayHint: 'The same word belongs in sport and beside a candle.', fullParse: 'MATCH is both a contest and a small fire starter.',
  },
  {
    id: 'double-spring', clue: 'Season for a coil', answer: 'SPRING', enumeration: '6', type: 'double-definition', definition: 'Season / coil',
    indicators: [], fodder: [], wordplayHint: 'One meaning is in the calendar; the other is mechanical.', fullParse: 'SPRING is both a season and a resilient coil.',
  },
  {
    id: 'double-watch', clue: 'Observe a timepiece', answer: 'WATCH', enumeration: '5', type: 'double-definition', definition: 'Observe / timepiece',
    indicators: [], fodder: [], wordplayHint: 'A verb and a noun share this spelling.', fullParse: 'WATCH means both observe and a timepiece.',
  },
  {
    id: 'double-file', clue: 'Folder with a smoothing tool', answer: 'FILE', enumeration: '4', type: 'double-definition', definition: 'Folder / smoothing tool',
    indicators: [], fodder: [], wordplayHint: 'Think of an office object and a workshop tool.', fullParse: 'FILE is both a folder of documents and a tool for smoothing.',
  },
  {
    id: 'double-current', clue: 'Present flow', answer: 'CURRENT', enumeration: '7', type: 'double-definition', definition: 'Present / flow',
    indicators: [], fodder: [], wordplayHint: 'One meaning concerns time; the other concerns movement.', fullParse: 'CURRENT means both present and a flow of water or electricity.',
  },

  {
    id: 'homophone-sail', clue: 'Travel by boat in reported bargain', answer: 'SAIL', enumeration: '4', type: 'homophone', definition: 'Travel by boat',
    indicators: [hint('reported', 'Signals a sound-alike.')], fodder: [hint('SALE', 'A bargain sounds like the answer.')],
    wordplayHint: 'Listen to a word meaning bargain.', fullParse: 'Travel by boat sounds like SALE (bargain), signalled by “reported”.',
  },
  {
    id: 'homophone-knight', clue: 'Cavalier reportedly after dark', answer: 'KNIGHT', enumeration: '6', type: 'homophone', definition: 'Cavalier',
    indicators: [hint('reportedly', 'Signals a sound-alike.')], fodder: [hint('NIGHT', 'After dark suggests a sound-alike of the answer.')],
    wordplayHint: 'Listen to the word for the hours of darkness.', fullParse: 'Cavalier sounds like NIGHT (after dark), signalled by “reportedly”.',
  },
  {
    id: 'homophone-flour', clue: 'Baking ingredient said to bloom', answer: 'FLOUR', enumeration: '5', type: 'homophone', definition: 'Baking ingredient',
    indicators: [hint('said', 'Signals a sound-alike.')], fodder: [hint('FLOWER', 'Something that blooms sounds like the answer.')],
    wordplayHint: 'Listen to something that blooms.', fullParse: 'Baking ingredient sounds like FLOWER (something that blooms), signalled by “said”.',
  },
  {
    id: 'homophone-pair', clue: 'Couple reportedly found in fruit bowl', answer: 'PAIR', enumeration: '4', type: 'homophone', definition: 'Couple',
    indicators: [hint('reportedly', 'Signals a sound-alike.')], fodder: [hint('PEAR', 'A fruit sounds like the answer.')],
    wordplayHint: 'Listen to the name of a fruit.', fullParse: 'Couple sounds like PEAR (fruit), signalled by “reportedly”.',
  },
  {
    id: 'homophone-son', clue: 'Male child reportedly seen in sky', answer: 'SON', enumeration: '3', type: 'homophone', definition: 'Male child',
    indicators: [hint('reportedly', 'Signals a sound-alike.')], fodder: [hint('SUN', 'Something seen in the sky sounds like the answer.')],
    wordplayHint: 'Listen to the name of our nearest star.', fullParse: 'Male child sounds like SUN (seen in the sky), signalled by “reportedly”.',
  },
  {
    id: 'homophone-stake', clue: 'Post reportedly served for dinner', answer: 'STAKE', enumeration: '5', type: 'homophone', definition: 'Post',
    indicators: [hint('reportedly', 'Signals a sound-alike.')], fodder: [hint('STEAK', 'A dinner item sounds like the answer.')],
    wordplayHint: 'Listen to a cut that might be served for dinner.', fullParse: 'Post sounds like STEAK (dinner item), signalled by “reportedly”.',
  },
  {
    id: 'homophone-waste', clue: 'Squander what sounds like the middle', answer: 'WASTE', enumeration: '5', type: 'homophone', definition: 'Squander',
    indicators: [hint('sounds like', 'Signals a sound-alike.')], fodder: [hint('WAIST', 'The middle of the body sounds like the answer.')],
    wordplayHint: 'Listen to a word for the middle of the body.', fullParse: 'Squander sounds like WAIST (the middle), signalled by “sounds like”.',
  },
  {
    id: 'homophone-brake', clue: 'Vehicle stopper reportedly takes a rest', answer: 'BRAKE', enumeration: '5', type: 'homophone', definition: 'Vehicle stopper',
    indicators: [hint('reportedly', 'Signals a sound-alike.')], fodder: [hint('BREAK', 'A rest sounds like the answer.')],
    wordplayHint: 'Listen to a word meaning a rest.', fullParse: 'Vehicle stopper sounds like BREAK (a rest), signalled by “reportedly”.',
  },

  {
    id: 'cryptic-mushroom', clue: 'It can grow rapidly while kept in the dark', answer: 'MUSHROOM', enumeration: '8', type: 'cryptic-definition', definition: 'Something that grows rapidly and may be kept in the dark',
    indicators: [], fodder: [], wordplayHint: 'Read the whole clue as one playful definition.', fullParse: 'The whole clue describes a MUSHROOM literally and plays on “mushroom” meaning to grow rapidly.',
  },
  {
    id: 'cryptic-egg-timer', clue: 'It counts down before breakfast is done', answer: 'EGG TIMER', enumeration: '3,5', type: 'cryptic-definition', definition: 'A device that counts down while an egg cooks',
    indicators: [], fodder: [], wordplayHint: 'The whole clue describes a small kitchen device.', fullParse: 'An EGG TIMER counts down the cooking time for a breakfast egg.',
  },
  {
    id: 'cryptic-alarm-clock', clue: 'A wake-up call with hands', answer: 'ALARM CLOCK', enumeration: '5,5', type: 'cryptic-definition', definition: 'A timepiece that wakes you',
    indicators: [], fodder: [], wordplayHint: 'The “hands” belong to a timekeeping object.', fullParse: 'An ALARM CLOCK makes a wake-up call and traditionally has hands.',
  },
  {
    id: 'cryptic-password', clue: 'Something you give a computer but should not tell anyone', answer: 'PASSWORD', enumeration: '8', type: 'cryptic-definition', definition: 'A secret used to gain computer access',
    indicators: [], fodder: [], wordplayHint: 'The whole clue describes a digital secret.', fullParse: 'A PASSWORD is supplied to a computer for access but should be kept secret.',
  },
  {
    id: 'cryptic-bookmark', clue: 'It knows where you stopped without reading', answer: 'BOOKMARK', enumeration: '8', type: 'cryptic-definition', definition: 'A marker that keeps your place in a book',
    indicators: [], fodder: [], wordplayHint: 'The whole clue describes a reader’s small helper.', fullParse: 'A BOOKMARK records where you stopped in a book without itself reading.',
  },

  {
    id: 'mixed-straw', clue: 'Drinking tube from small wart turned', answer: 'STRAW', enumeration: '5', type: 'mixed', definition: 'Drinking tube',
    indicators: [hint('turned', 'Signals reversal of WART.')], fodder: [hint('S + WART', 'Use S (small) and reverse WART.')],
    wordplayHint: 'Put the abbreviation for small before WART reversed.', fullParse: 'Drinking tube is S (small) + TRAW (WART turned).',
  },
  {
    id: 'mixed-party', clue: 'Celebration from trap turned with unknown', answer: 'PARTY', enumeration: '5', type: 'mixed', definition: 'Celebration',
    indicators: [hint('turned', 'Signals reversal of TRAP.'), hint('with', 'Joins the reversed piece to another piece.')], fodder: [hint('TRAP + Y', 'Reverse TRAP, then add Y (an algebraic unknown).')],
    wordplayHint: 'Reverse TRAP and add a common algebraic unknown.', fullParse: 'Celebration is PART (TRAP turned) + Y (unknown).',
  },
  {
    id: 'mixed-prawn', clue: 'Shrimp from warp turned north', answer: 'PRAWN', enumeration: '5', type: 'mixed', definition: 'Shrimp',
    indicators: [hint('turned', 'Signals reversal of WARP.')], fodder: [hint('WARP + N', 'Reverse WARP, then add N (north).')],
    wordplayHint: 'Reverse WARP and add the abbreviation for north.', fullParse: 'Shrimp is PRAW (WARP turned) + N (north).',
  },
  {
    id: 'mixed-diagram', clue: 'Drawing assistance turned with weight', answer: 'DIAGRAM', enumeration: '7', type: 'mixed', definition: 'Drawing',
    indicators: [hint('turned', 'Signals reversal of AID.'), hint('with', 'Joins the reversed piece to another piece.')], fodder: [hint('AID + GRAM', 'Reverse AID, then add a metric weight.')],
    wordplayHint: 'Reverse a word for assistance and add a metric weight.', fullParse: 'Drawing is DIA (AID turned) + GRAM (weight).',
  },
  {
    id: 'mixed-drawl', clue: 'Speak slowly when ward returns with learner', answer: 'DRAWL', enumeration: '5', type: 'mixed', definition: 'Speak slowly',
    indicators: [hint('returns', 'Signals reversal of WARD.'), hint('with', 'Joins the reversed piece to another piece.')], fodder: [hint('WARD + L', 'Reverse WARD, then add L (learner).')],
    wordplayHint: 'Reverse WARD and add the abbreviation for learner.', fullParse: 'Speak slowly is DRAW (WARD returns) + L (learner).',
  },
];
