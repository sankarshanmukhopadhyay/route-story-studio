import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function loadSample(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Use sample route' }).click();
  await expect(page.locator('#route-summary')).toBeVisible();
  await expect(page.locator('#poster-preview svg')).toBeVisible();
}

test('completes the sample import and customisation workflow', async ({ page }) => {
  await loadSample(page);
  await expect(page.locator('#summary-points')).not.toHaveText('—');
  await page.locator('#story-title').fill('Assured sample journey');
  await page.locator('#layout').selectOption('landscape');
  await page.locator('#units').selectOption('imperial');
  await expect(page.locator('#poster-preview svg')).toContainText('Assured sample journey');
  await expect(page.locator('#poster-preview')).toHaveCSS('aspect-ratio', '16 / 9');
});

test('downloads SVG output', async ({ page }) => {
  await loadSample(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
});

test('imports a GPX file from the file chooser', async ({ page }) => {
  await page.goto('/');
  await page.locator('#gpx-file').setInputFiles('tests/fixtures/sample-route.gpx');
  await expect(page.locator('#route-summary')).toBeVisible();
  await expect(page.locator('#file-status')).toContainText('points loaded');
});

test('has no serious or critical axe violations', async ({ page }) => {
  await loadSample(page);
  const axeSource = await readFile(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => window.axe.run(document, {
    resultTypes: ['violations'],
    rules: { 'color-contrast': { enabled: true } },
  }));
  const blocking = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
