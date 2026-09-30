// src/index.js
import { discoverBooks } from './discoverer.js';
import { extractBookDetail } from './extractor.js';
import { normalizeAndValidate } from './validator.js';
import { saveRecords } from './storage.js';
import { generateReport } from './reporter.js';

async function main() {
  const startTime = new Date().toISOString();
  const stats = {
    startTime,
    pagesFetched: 0,
    cacheHits: 0,
    validRecords: 0,
    invalidRecords: 0,
    failedPages: []
  };

  const validRecords = [];
  const errorRecords = [];

  const booksToVisit = await discoverBooks();

  for (const { productUrl, sourcePage } of booksToVisit) {
    try {
      const rawRecord = await extractBookDetail(productUrl, sourcePage);
      const validation = normalizeAndValidate(rawRecord);

      if (validation.success) {
        validRecords.push(validation.data);
      } else {
        errorRecords.push(validation);
        stats.invalidRecords++;
      }
    } catch (err) {
      console.warn(`[SKIPPED FAILED PAGE]: ${productUrl} - ${err.message}`);
      stats.failedPages.push({ url: productUrl, error: err.message });
    }
  }

  const { savedCount } = await saveRecords(validRecords, errorRecords);
  stats.validRecords = savedCount;

  const report = await generateReport(stats);
  console.log('\n--- FINAL RUN REPORT ---');
  console.log(JSON.stringify(report, null, 2));
}

main();