import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG } from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithCache(url, cacheFileName, retries = 1) {
  await fs.mkdir(CONFIG.CACHE_DIR, { recursive: true });
  const cachePath = path.join(CONFIG.CACHE_DIR, cacheFileName);

  // Read cache
  try {
    const cachedData = await fs.readFile(cachePath, 'utf-8');
    return { html: cachedData, fromCache: true, status: 200 };
  } catch {
    // Cache miss
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(CONFIG.DELAY_MS * 2); // Wait before retry
      } else {
        await sleep(CONFIG.DELAY_MS);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

      const response = await fetch(url, {
        headers: { 'User-Agent': CONFIG.USER_AGENT },
        signal: controller.signal
      });
      clearTimeout(timer);

      // Do NOT retry 404 or 403
      if (response.status === 404 || response.status === 403) {
        throw new Error(`HTTP ${response.status} (Non-retryable)`);
      }

      // Retry 5xx server errors
      if (response.status >= 500 && attempt < retries) {
        continue;
      }

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      await fs.writeFile(cachePath, html, 'utf-8');
      return { html, fromCache: false, status: 200 };
    } catch (err) {
      if (err.message.includes('Non-retryable')) {
        throw err;
      }
      if (attempt === retries) {
        throw err;
      }
    }
  }
}