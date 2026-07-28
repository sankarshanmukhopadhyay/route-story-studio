import { test, expect } from '@playwright/test';

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
  await page.locator('#route-file').setInputFiles('tests/fixtures/sample-route.gpx');
  await expect(page.locator('#route-summary')).toBeVisible();
  await expect(page.locator('#file-status')).toContainText('points loaded');
});

test('has no serious or critical axe violations', async ({ page }) => {
  await loadSample(page);
  await page.addScriptTag({ url: '/__test__/axe.min.js' });
  const results = await page.evaluate(async () => window.axe.run(document, {
    resultTypes: ['violations'],
    rules: { 'color-contrast': { enabled: true } },
  }));
  const blocking = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});

test('makes map consent discoverable and sends a website Referer', async ({ page }) => {
  const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  let requests = 0;
  await page.route('https://tile.openstreetmap.org/**', async (route) => {
    requests += 1;
    expect(route.request().headers().referer).toMatch(/^http:\/\/127\.0\.0\.1:4173\//);
    await route.fulfill({ status: 200, contentType: 'image/png', body: tile, headers: { 'Cache-Control': 'public, max-age=604800' } });
  });
  await loadSample(page);
  await page.locator('#background-mode').selectOption('map');
  await expect(page.locator('#map-controls')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Consent and load map now' })).toBeFocused({ timeout: 5_000 });
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  await page.getByRole('button', { name: 'Consent and load map now' }).click();
  await expect(page.locator('#file-status')).toContainText('Map background loaded');
  expect(requests).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
});

test('reviews a supported Google Maps route intent locally', async ({ page }) => {
  await page.goto('/');
  await page.locator('#map-link').fill('https://www.google.com/maps/dir/?api=1&origin=28.6139,77.2090&destination=Manali%2C%20India&travelmode=driving');
  await page.getByRole('button', { name: 'Review route intent' }).click();
  await expect(page.locator('#route-intent-review')).toBeVisible();
  await expect(page.locator('#intent-origin')).toContainText('28.61390');
  await expect(page.locator('#intent-destination')).toHaveText('Manali, India');
  await expect(page.locator('#intent-mode')).toHaveText('driving');
});
