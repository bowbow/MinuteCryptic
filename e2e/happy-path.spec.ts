import { expect, test } from '@playwright/test';

test('solve a clue with progressive hints', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /one clue/i })).toBeVisible();
  await page.getByRole('button', { name: /get a clue/i }).click();

  const firstClue = await page.getByRole('heading', { level: 1 }).textContent();
  await page.getByRole('button', { name: 'Show definition' }).click();
  await expect(page.getByLabel('Definition hint')).toBeVisible();
  await expect(page.locator('.definition-highlight')).toBeVisible();
  await page.getByRole('button', { name: 'Indicators' }).click();
  await expect(page.getByLabel('Indicators hint')).toBeVisible();
  await page.getByRole('button', { name: 'Fodder' }).click();
  await expect(page.getByLabel('Fodder hint')).toBeVisible();
  await page.getByRole('button', { name: 'Wordplay' }).click();
  await expect(page.getByLabel('Wordplay hint')).toBeVisible();

  await page.getByRole('button', { name: 'Reveal a letter' }).click();
  await expect(page.locator('.answer-mask')).not.toHaveText(/^[_\s]+$/);
  await page.getByRole('button', { name: 'Reveal answer' }).click();
  await expect(page.getByText('The answer', { exact: true })).toBeVisible();
  await expect(page.getByText(/Full parse:/)).toBeVisible();

  await page.getByRole('button', { name: /another clue/i }).click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(firstClue ?? '');
  await expect(page.getByLabel('Wordplay hint')).toHaveCount(0);
  await expect(page.getByLabel('Definition hint')).toHaveCount(0);
  await expect(page.getByText('The answer', { exact: true })).toHaveCount(0);
});
