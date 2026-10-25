import { expect, test } from '@playwright/test';

test('solve a clue with progressive hints', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /one clue/i })).toBeVisible();
  await page.getByRole('button', { name: /get a clue/i }).click();
  await expect(page.locator('.quote-mark')).toHaveCount(0);
  await expect(page.getByText(/practice clue/i)).toHaveCount(0);
  await expect(page.getByText('anagram', { exact: true })).toHaveCount(0);

  const firstClue = await page.getByRole('heading', { level: 1 }).textContent();
  const definitionButton = page.getByRole('button', { name: 'Definition' });
  const indicatorButton = page.getByRole('button', { name: 'Indicators' });
  const fodderButton = page.getByRole('button', { name: 'Fodder' });
  await page.locator('.site-header').hover();
  await expect(definitionButton).toHaveCSS('background-color', 'rgb(240, 198, 111)');
  await expect(indicatorButton).toHaveCSS('background-color', 'rgb(240, 165, 143)');
  await expect(fodderButton).toHaveCSS('background-color', 'rgb(145, 206, 213)');

  await definitionButton.click();
  await expect(page.getByLabel('Definition hint')).toBeVisible();
  await expect(page.locator('.clue-highlight--definition')).toBeVisible();
  await indicatorButton.click();
  await expect(page.getByLabel('Indicators hint')).toBeVisible();
  await expect(page.locator('.clue-highlight--indicator')).toBeVisible();
  await fodderButton.click();
  await expect(page.getByLabel('Fodder hint')).toBeVisible();
  await expect(page.locator('.clue-highlight--fodder')).toBeVisible();
  const answerInput = page.getByRole('textbox', { name: /your answer/i });
  await expect(answerInput).toHaveAttribute('placeholder', '______');
  await page.getByRole('button', { name: 'Reveal a letter' }).click();
  await expect(answerInput).not.toHaveAttribute('placeholder', '______');
  await page.getByRole('button', { name: 'Reveal answer' }).click();
  await expect(page.locator('.answer-mask')).toHaveText('SILENT');
  await expect(page.getByText('The answer', { exact: true })).toBeVisible();
  await expect(page.getByText(/Full parse:/)).toBeVisible();

  await page.getByRole('button', { name: /reset clue/i }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(firstClue ?? '');
  await expect(page.getByLabel('Definition hint')).toHaveCount(0);
  await expect(page.getByText('The answer', { exact: true })).toHaveCount(0);
});

test('checks an entered answer and starts again after success', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a clue/i }).click();

  const answerInput = page.getByRole('textbox', { name: /your answer/i });
  await answerInput.fill('listen');
  await page.getByRole('button', { name: /check answer/i }).click();
  await expect(page.getByRole('status')).toContainText('Not quite');
  await expect(answerInput).toHaveValue('LISTEN');

  await answerInput.fill('silent');
  await answerInput.press('Enter');
  await expect(page.getByRole('status')).toContainText('That’s right!');
  await expect(page.getByLabel('Answer: SILENT')).toHaveText('SILENT');

  await page.getByRole('button', { name: /play another clue/i }).click();
  await expect(page.getByRole('textbox', { name: /your answer/i })).toHaveValue('');
  await expect(page.getByText('That’s right!')).toHaveCount(0);
});
