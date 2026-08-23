import { discoverBooks } from './discoverer.js';
import { extractBookDetail } from './extractor.js';

async function main() {
  const booksToVisit = await discoverBooks();
  const rawRecords = [];

  for (const { productUrl, sourcePage } of booksToVisit) {
    const rawRecord = await extractBookDetail(productUrl, sourcePage);
    rawRecords.push(rawRecord);
  }

  console.log(`detail_pages=${rawRecords.length}`);
  console.log('Sample raw record:');
  console.log(JSON.stringify(rawRecords[0], null, 2));
}

main();