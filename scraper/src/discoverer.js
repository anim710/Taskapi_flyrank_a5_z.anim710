import * as cheerio from 'cheerio';
import { fetchWithCache } from './fetcher.js';
import { CONFIG } from './config.js';

export async function discoverBooks(maxPages = CONFIG.MAX_CATALOGUE_PAGES) {
  let currentUrl = CONFIG.START_URL;
  let pageNum = 1;
  const discoveredItems = [];

  while (currentUrl && pageNum <= maxPages) {
    const cacheFileName = `catalogue-page-${pageNum}.html`;
    const { html } = await fetchWithCache(currentUrl, cacheFileName);
    const $ = cheerio.load(html);

    $('article.product_pod h3 a').each((_, el) => {
      const relativeHref = $(el).attr('href');
      const absoluteUrl = new URL(relativeHref, currentUrl).href;
      discoveredItems.push({
        productUrl: absoluteUrl,
        sourcePage: currentUrl
      });
    });

    const nextHref = $('.pager .next a').attr('href');
    if (nextHref) {
      currentUrl = new URL(nextHref, currentUrl).href;
      pageNum++;
    } else {
      currentUrl = null;
    }
  }

  // Deduplicate by productUrl
  const uniqueItemsMap = new Map();
  for (const item of discoveredItems) {
    if (!uniqueItemsMap.has(item.productUrl)) {
      uniqueItemsMap.set(item.productUrl, item);
    }
  }

  const uniqueItems = Array.from(uniqueItemsMap.values());

  console.log(
    `catalogue_pages=${pageNum - 1}, discovered=${discoveredItems.length}, unique_urls=${uniqueItems.length}`
  );

  return uniqueItems;
}