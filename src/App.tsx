import { useEffect, useMemo, useState } from 'react';
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

function readInitialState(): PersistedState {
  if (typeof window !== 'undefined') {
    const restored = restoreState(window.localStorage.getItem(STORAGE_KEY), clueIds);
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
}: {
  children: React.ReactNode;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button className="hint-button" aria-expanded={expanded} onClick={onClick} type="button">
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
    const deck = createDeck(clueIds);
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
      const deck = current.deck ?? createDeck(clueIds);
      return {
        version: STORAGE_VERSION,
        started: true,
        deck: advanceDeck(deck, clueIds),
        reveals: emptyReveals(),
      };
    });
  };

  const allLettersVisible = currentClue
    ? state.reveals.letters.length >= letterPositions(currentClue.answer).length
    : false;

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
          <p className="intro">Reveal indicators, fodder, wordplay, or a letter whenever you need a nudge.</p>
          <button className="primary-button" type="button" onClick={start}>Get a clue <span aria-hidden="true">→</span></button>
        </section>
      ) : (
        <section className="puzzle" aria-labelledby="clue-heading">
          <div className="progress-row">
            <span className="eyebrow">Clue {state.deck!.index + 1} of {clues.length}</span>
            <span className="clue-type">{currentClue.type.replace('-', ' ')}</span>
          </div>

          <article className="clue-card">
            <span className="quote-mark" aria-hidden="true">“</span>
            <h1 id="clue-heading">
              {state.reveals.definition
                ? segmentClueText(currentClue.clue, currentClue.definitionParts).map((segment, index) =>
                    segment.isDefinition ? (
                      <mark className="definition-highlight" key={`${segment.text}-${index}`}>{segment.text}</mark>
                    ) : (
                      segment.text
                    ),
                  )
                : currentClue.clue}
            </h1>
            <p className="enumeration">({currentClue.enumeration})</p>
            <p className="answer-mask" aria-label={`Answer pattern: ${maskAnswer(currentClue.answer, new Set(state.reveals.letters)).replaceAll('_', 'blank')}`}>
              {maskAnswer(currentClue.answer, new Set(state.reveals.letters))}
            </p>
          </article>

          <div className="hint-grid" aria-label="Clue hints">
            <div>
              <RevealButton expanded={state.reveals.definition} onClick={() => setReveal('definition')}>Show definition</RevealButton>
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
              <RevealButton expanded={state.reveals.indicators} onClick={() => setReveal('indicators')}>Indicators</RevealButton>
              {state.reveals.indicators && (
                <div className="reveal" aria-live="polite">
                  <HintPanel title="Indicators" items={currentClue.indicators} emptyMessage="This clue type has no explicit indicator." />
                </div>
              )}
            </div>
            <div>
              <RevealButton expanded={state.reveals.fodder} onClick={() => setReveal('fodder')}>Fodder</RevealButton>
              {state.reveals.fodder && (
                <div className="reveal" aria-live="polite">
                  <HintPanel title="Fodder" items={currentClue.fodder} emptyMessage="This clue type has no explicit fodder." />
                </div>
              )}
            </div>
            <div>
              <RevealButton expanded={state.reveals.wordplay} onClick={() => setReveal('wordplay')}>Wordplay</RevealButton>
              {state.reveals.wordplay && (
                <div className="reveal" aria-live="polite">
                  <section className="hint-panel" aria-label="Wordplay hint">
                    <p className="hint-label">Wordplay</p>
                    <p>{currentClue.wordplayHint}</p>
                  </section>
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
              <h2>{currentClue.answer}</h2>
              <p><strong>Definition:</strong> {currentClue.definition}</p>
              <p><strong>Full parse:</strong> {currentClue.fullParse}</p>
            </section>
          ) : (
            <button className="text-button" type="button" onClick={() => setReveal('answer')}>Reveal answer</button>
          )}

          <button className="primary-button another" type="button" onClick={next}>Another clue <span aria-hidden="true">→</span></button>
        </section>
      )}

      <footer><span>100 original clues</span><span aria-hidden="true">◆</span><span>No clock. No score.</span></footer>
    </main>
  );
}
