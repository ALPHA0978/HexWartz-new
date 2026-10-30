// Verify on-demand progressive playback, skip during buffering, and media failure.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5197', '--strictPort'], { stdio: 'pipe' });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      server.stdout.on('data', data => { if (data.toString().includes('Local:')) resolve(); });
      server.once('error', reject);
      server.once('exit', code => reject(new Error(`Vite exited: ${code}`)));
    });
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.route('**/music/theme.mp3', route => route.abort());
    const requests = [];
    page.on('request', request => requests.push(new URL(request.url()).pathname));
    await page.goto('http://127.0.0.1:5197', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('video').getAttribute('src'), null);
    assert.equal(await page.locator('video').getAttribute('preload'), 'none');
    assert.equal(requests.includes('/video/hexwartz-intro.mp4'), false, 'No eager video download');
    assert.equal(await page.locator('.landing-hero').count(), 0, 'Do not mount hidden page artwork');
    assert.ok(!requests.some(url => url.includes('InvitationLetter')), 'Defer the letter animation chunk');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 190000, uploadThroughput: 100000 });
    await page.getByRole('button', { name: 'Enter HexWartz Hackathon', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('video')?.currentTime > 0.1, null, { timeout: 90000 });
    const source = await page.locator('video').evaluate(video => ({ src: video.currentSrc, width: video.videoWidth, height: video.videoHeight, duration: video.duration }));
    assert.ok(source.src.endsWith('/video/hexwartz-intro.mp4'), 'Stream the original file directly');
    assert.equal(source.width, 1280);
    assert.equal(source.height, 720);
    await page.getByRole('button', { name: 'Skip to castle' }).click();
    await page.locator('.cinematic-intro-overlay').waitFor({ state: 'detached' });
    assert.equal(await page.locator('video').count(), 0);
    await page.locator('.landing-hero').waitFor({ state: 'visible' });

    const skipPage = await browser.newPage();
    await skipPage.route('**/video/hexwartz-intro.mp4', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.continue().catch(() => {});
    });
    await skipPage.goto('http://127.0.0.1:5197', { waitUntil: 'domcontentloaded' });
    await skipPage.getByRole('button', { name: 'Enter HexWartz Hackathon', exact: true }).click();
    await skipPage.getByRole('button', { name: 'Skip cinematic prologue' }).click();
    await skipPage.locator('.cinematic-intro-overlay').waitFor({ state: 'detached' });
    await skipPage.waitForTimeout(3500);
    assert.equal(await skipPage.locator('video').count(), 0, 'Late video data must not restart the intro');

    const failedPage = await browser.newPage();
    await failedPage.route('**/video/hexwartz-intro.mp4', route => route.fulfill({ status: 503, body: 'Unavailable' }));
    await failedPage.goto('http://127.0.0.1:5197', { waitUntil: 'domcontentloaded' });
    await failedPage.getByRole('button', { name: 'Enter HexWartz Hackathon', exact: true }).click();
    await failedPage.locator('.cinematic-intro-overlay').waitFor({ state: 'detached' });
    await failedPage.locator('.landing-hero').waitFor({ state: 'visible' });
    console.log(JSON.stringify({ source, skipDuringBuffering: true, mediaFailureFallback: true }));
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
