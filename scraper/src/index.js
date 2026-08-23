import fs from 'node:fs/promises';
import path from 'node:path';

const CACHE_DIR = './cache';
const PAGE_1_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const CACHE_FILE = path.join(CACHE_DIR, 'catalogue-page-1.html');

// 1. Identifying User-Agent
const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/your-username/scraper)';
const TIMEOUT_MS = 5000;

export async function fetchWithCache(url, cachePath) {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  // Check cache first
  try {
    const cachedData = await fs.readFile(cachePath, 'utf-8');
    console.log(`CACHE HIT: ${cachePath} (${cachedData.length} bytes)`);
    return cachedData;
  } catch {
    // Cache miss: proceed to fetch
  }

  console.log(`FETCH: ${url}`);
  
  // 2. Timeout using AbortController
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(timer);

    // 3. Status check
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const html = await response.text();
    
    // 4. Cache save
    await fs.writeFile(cachePath, html, 'utf-8');
    console.log(`SAVED: ${cachePath} (${html.length} bytes)`);
    return html;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Stage 1 execution entry
async function main() {
  await fetchWithCache(PAGE_1_URL, CACHE_FILE);
}

main();