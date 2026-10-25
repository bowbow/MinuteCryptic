import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('starts on demand and reveals hints independently', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByLabelText('Clue hints')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /get a clue/i }));
    expect(screen.getByLabelText('Clue hints')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Indicators' }));
    expect(screen.getByLabelText('Indicators hint')).toBeInTheDocument();
    expect(screen.queryByLabelText('Fodder hint')).not.toBeInTheDocument();
    expect(screen.queryByText('The answer', { selector: 'p' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Definition' }));
    expect(screen.getByLabelText('Definition hint')).toBeInTheDocument();
    expect(document.querySelector('.clue-highlight--definition')).not.toBeNull();
    expect(screen.queryByLabelText('Fodder hint')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fodder' }));
    expect(screen.getByLabelText('Fodder hint')).toBeInTheDocument();
    expect(screen.getByLabelText('Indicators hint')).toBeInTheDocument();
    expect(document.querySelector('.clue-highlight--indicator')).not.toBeNull();
    expect(document.querySelector('.clue-highlight--fodder')).not.toBeNull();
  });

  it('reveals an answer and resets all reveal state for the practice clue', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /get a clue/i }));
    await user.click(screen.getByRole('button', { name: 'Definition' }));
    await user.click(screen.getByRole('button', { name: /reveal answer/i }));

    expect(screen.getByLabelText(/^Answer:/)).toHaveTextContent('SILENT');
    const answerPanel = screen.getByText('The answer', { selector: 'p' }).closest('section');
    expect(answerPanel).not.toBeNull();
    expect(within(answerPanel!).getByText(/Full parse:/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset clue/i }));
    expect(screen.queryByLabelText('Definition hint')).not.toBeInTheDocument();
    expect(screen.queryByText('The answer', { selector: 'p' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definition' })).toHaveAttribute('aria-expanded', 'false');
  });
});
