import { discoverBooks } from './discoverer.js';
import { extractBookDetail } from './extractor.js';
import { normalizeAndValidate } from './validator.js';
import { saveRecords } from './storage.js';

async function main() {
  const booksToVisit = await discoverBooks();
  const validRecords = [];
  const errorRecords = [];

  for (const { productUrl, sourcePage } of booksToVisit) {
    const rawRecord = await extractBookDetail(productUrl, sourcePage);
    const validation = normalizeAndValidate(rawRecord);

    if (validation.success) {
      validRecords.push(validation.data);
    } else {
      errorRecords.push(validation);
    }
  }

  const { savedCount, errorCount } = await saveRecords(validRecords, errorRecords);

  console.log(`Validated: ${validRecords.length}, Errors: ${errorCount}`);
  console.log(`Stored in books.json: ${savedCount} records`);
}

main();