import * as cheerio from 'cheerio';
import crypto from 'node:crypto';
import { fetchWithCache } from './fetcher.js';

export async function extractBookDetail(productUrl, catalogueUrl) {
  // Generate a stable cache file name from the product URL
  const hash = crypto.createHash('md5').update(productUrl).digest('hex');
  const cacheFileName = `book-${hash}.html`;

  const { html } = await fetchWithCache(productUrl, cacheFileName);
  const $ = cheerio.load(html);

  // Target the specific product main container
  const $main = $('.product_main');

  const title = $main.find('h1').text().trim();
  const price_text = $main.find('.price_color').text().trim();
  const availability_text = $main.find('.instock.availability').text().trim().replace(/\s+/g, ' ');

  // Rating class extraction (e.g., class="star-rating Three")
  const ratingClass = $main.find('.star-rating').attr('class') || '';
  const rating_text = ratingClass.replace('star-rating', '').trim();

  // Description extraction (optional - store null if missing)
  const descriptionText = $('#product_description').next('p').text().trim();
  const description = descriptionText.length > 0 ? descriptionText : null;

  return {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: catalogueUrl,
    fetched_at: new Date().toISOString()
  };
}