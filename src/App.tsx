import { useEffect, useMemo, useState } from 'react';
import { FIXED_CLUE_ID } from './config';
import { clues } from './data/clues';
import { letterPositions, maskAnswer, revealNextLetter } from './lib/answer';
import { advanceDeck, createDeck } from './lib/deck';
import { segmentClueText } from './lib/clue-text';
import {
  emptyReveals,
  restoreState,
  serializeState,
  STORAGE_KEY,
  STORAGE_VERSION,
  type PersistedState,
  type RevealState,
} from './lib/persistence';
import type { HintDetail } from './types';

const clueIds = clues.map((clue) => clue.id);
const cluesById = new Map(clues.map((clue) => [clue.id, clue]));
const activeClueIds = FIXED_CLUE_ID ? [FIXED_CLUE_ID] : clueIds;
const isFixedClueMode = FIXED_CLUE_ID !== null;

function readInitialState(): PersistedState {
  if (typeof window !== 'undefined') {
    const restored = restoreState(window.localStorage.getItem(STORAGE_KEY), activeClueIds);
    if (restored) return restored;
  }
  return { version: STORAGE_VERSION, started: false, deck: null, reveals: emptyReveals() };
}

function HintPanel({ title, items, emptyMessage }: { title: string; items: HintDetail[]; emptyMessage: string }) {
  return (
    <section className="hint-panel" aria-label={`${title} hint`}>
      <p className="hint-label">{title}</p>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={`${item.text}-${item.explanation}`}>
              <strong>{item.text}</strong>
              <span>{item.explanation}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{emptyMessage}</p>
      )}
    </section>
  );
}

function RevealButton({
  children,
  expanded,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  expanded: boolean;
  onClick: () => void;
  tone: 'definition' | 'indicator' | 'fodder';
}) {
  return (
    <button className={`hint-button hint-button--${tone}`} aria-expanded={expanded} onClick={onClick} type="button">
      <span>{children}</span>
      <span aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
  );
}

export default function App() {
  const [state, setState] = useState<PersistedState>(readInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, serializeState(state));
  }, [state]);

  const currentClue = useMemo(() => {
    if (!state.started || !state.deck) return null;
    return cluesById.get(state.deck.order[state.deck.index] ?? '') ?? null;
  }, [state.deck, state.started]);

  const start = () => {
    const deck = createDeck(activeClueIds);
    setState({ version: STORAGE_VERSION, started: true, deck, reveals: emptyReveals() });
  };

  const setReveal = (key: keyof Omit<RevealState, 'letters'>) => {
    setState((current) => ({
      ...current,
      reveals: { ...current.reveals, [key]: true },
    }));
  };

  const revealLetter = () => {
    if (!currentClue) return;
    setState((current) => ({
      ...current,
      reveals: {
        ...current.reveals,
        letters: revealNextLetter(currentClue.answer, current.reveals.letters),
      },
    }));
  };

  const next = () => {
    setState((current) => {
      const deck = current.deck ?? createDeck(activeClueIds);
      return {
        version: STORAGE_VERSION,
        started: true,
        deck: advanceDeck(deck, activeClueIds),
        reveals: emptyReveals(),
      };
    });
  };

  const allLettersVisible = currentClue
    ? state.reveals.letters.length >= letterPositions(currentClue.answer).length
    : false;

  const displayedAnswer = currentClue
    ? state.reveals.answer
      ? currentClue.answer
      : maskAnswer(currentClue.answer, new Set(state.reveals.letters))
    : '';

  const clueHighlights = currentClue
    ? [
        ...(state.reveals.definition ? [{ kind: 'definition' as const, parts: currentClue.definitionParts }] : []),
        ...(state.reveals.indicators ? [{ kind: 'indicator' as const, parts: currentClue.indicators.flatMap((hint) => hint.clueParts) }] : []),
        ...(state.reveals.fodder ? [{ kind: 'fodder' as const, parts: currentClue.fodder.flatMap((hint) => hint.clueParts) }] : []),
      ]
    : [];

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="One Cryptic home">
          <span aria-hidden="true" className="wordmark-mark">1</span>
          <span>One Cryptic</span>
        </a>
        <span className="issue">A small daily diversion</span>
      </header>

      {!currentClue ? (
        <section className="landing" aria-labelledby="welcome-title">
          <p className="eyebrow">Your next small puzzle</p>
          <h1 id="welcome-title">One clue.<br />Take your time.</h1>
          <p className="intro">Reveal the definition, indicators, fodder, or a letter whenever you need a nudge.</p>
          <button className="primary-button" type="button" onClick={start}>Get a clue <span aria-hidden="true">→</span></button>
        </section>
      ) : (
        <section className="puzzle" aria-labelledby="clue-heading">
          <article className="clue-card">
            <span className="quote-mark" aria-hidden="true">“</span>
            <h1 id="clue-heading">
              {clueHighlights.length
                ? segmentClueText(currentClue.clue, clueHighlights).map((segment, index) =>
                    segment.highlight ? (
                      <mark className={`clue-highlight clue-highlight--${segment.highlight}`} key={`${segment.text}-${index}`}>{segment.text}</mark>
                    ) : (
                      segment.text
                    ),
                  )
                : currentClue.clue}
            </h1>
            <p className="enumeration">({currentClue.enumeration})</p>
            <p className="answer-mask" aria-label={state.reveals.answer ? `Answer: ${currentClue.answer}` : `Answer pattern: ${displayedAnswer.replaceAll('_', 'blank')}`}>
              {displayedAnswer}
            </p>
          </article>

          <div className="hint-grid" aria-label="Clue hints">
            <div>
              <RevealButton tone="definition" expanded={state.reveals.definition} onClick={() => setReveal('definition')}>Definition</RevealButton>
              {state.reveals.definition && (
                <div className="reveal" aria-live="polite">
                  <section className="hint-panel" aria-label="Definition hint">
                    <p className="hint-label">Definition</p>
                    <p>{currentClue.definitionParts.length > 1 ? 'The highlighted phrases are the two definitions:' : 'The highlighted part of the clue is the definition:'}</p>
                    <p className="definition-quote">{currentClue.definitionParts.map((part) => `“${part}”`).join(' and ')}</p>
                  </section>
                </div>
              )}
            </div>
            <div>
              <RevealButton tone="indicator" expanded={state.reveals.indicators} onClick={() => setReveal('indicators')}>Indicators</RevealButton>
              {state.reveals.indicators && (
                <div className="reveal" aria-live="polite">
                  <HintPanel title="Indicators" items={currentClue.indicators} emptyMessage="This clue type has no explicit indicator." />
                </div>
              )}
            </div>
            <div>
              <RevealButton tone="fodder" expanded={state.reveals.fodder} onClick={() => setReveal('fodder')}>Fodder</RevealButton>
              {state.reveals.fodder && (
                <div className="reveal" aria-live="polite">
                  <HintPanel title="Fodder" items={currentClue.fodder} emptyMessage="This clue type has no explicit fodder." />
                </div>
              )}
            </div>
            <button className="hint-button" type="button" onClick={revealLetter} disabled={allLettersVisible || state.reveals.answer}>
              <span>Reveal a letter</span><span aria-hidden="true">＋</span>
            </button>
          </div>

          {state.reveals.answer ? (
            <section className="answer-panel" aria-live="polite">
              <p className="eyebrow">The answer</p>
              <p><strong>Definition:</strong> {currentClue.definition}</p>
              <p><strong>Full parse:</strong> {currentClue.fullParse}</p>
            </section>
          ) : (
            <button className="text-button" type="button" onClick={() => setReveal('answer')}>Reveal answer</button>
          )}

          <button className="primary-button another" type="button" onClick={next}>
            {isFixedClueMode ? 'Reset clue' : 'Another clue'} <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      <footer><span>100 original clues</span><span aria-hidden="true">◆</span><span>No clock. No score.</span></footer>
    </main>
  );
}
