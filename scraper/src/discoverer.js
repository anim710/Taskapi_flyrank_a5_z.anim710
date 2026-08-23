import * as cheerio from 'cheerio';
import { fetchWithCache } from './fetcher.js';
import { CONFIG } from './config.js';

export async function discoverBooks(maxPages = CONFIG.MAX_CATALOGUE_PAGES) {
  let currentUrl = CONFIG.START_URL;
  let pageNum = 1;
  const bookUrls = [];

  while (currentUrl && pageNum <= maxPages) {
    const cacheFileName = `catalogue-page-${pageNum}.html`;
    const { html } = await fetchWithCache(currentUrl, cacheFileName);
    const $ = cheerio.load(html);

    // Extract book links and resolve relative -> absolute URLs
    $('article.product_pod h3 a').each((_, el) => {
      const relativeHref = $(el).attr('href');
      const absoluteUrl = new URL(relativeHref, currentUrl).href;
      bookUrls.push(absoluteUrl);
    });

    // Extract next page link
    const nextHref = $('.pager .next a').attr('href');
    if (nextHref) {
      currentUrl = new URL(nextHref, currentUrl).href;
      pageNum++;
    } else {
      currentUrl = null;
    }
  }

  const uniqueUrls = [...new Set(bookUrls)];

  console.log(
    `catalogue_pages=${pageNum - 1}, discovered=${bookUrls.length}, unique_urls=${uniqueUrls.length}`
  );

  return uniqueUrls;
}