import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG } from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithCache(url, cacheFileName) {
  await fs.mkdir(CONFIG.CACHE_DIR, { recursive: true });
  const cachePath = path.join(CONFIG.CACHE_DIR, cacheFileName);

  // Check local cache
  try {
    const cachedData = await fs.readFile(cachePath, 'utf-8');
    return { html: cachedData, fromCache: true };
  } catch {
    // Cache miss - fetch from web
  }

  // Delay real network requests
  await sleep(CONFIG.DELAY_MS);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': CONFIG.USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const html = await response.text();
    await fs.writeFile(cachePath, html, 'utf-8');
    return { html, fromCache: false };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}