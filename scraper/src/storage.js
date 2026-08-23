import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG } from './config.js';

export async function saveRecords(validRecords, errorRecords) {
  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  const booksPath = path.join(CONFIG.OUTPUT_DIR, 'books.json');
  const errorsPath = path.join(CONFIG.OUTPUT_DIR, 'errors.json');

  // Idempotency: Deduplicate by canonical product_url
  const uniqueMap = new Map();
  for (const record of validRecords) {
    uniqueMap.set(record.product_url, record);
  }
  const idempotentRecords = Array.from(uniqueMap.values());

  // Write outputs
  await fs.writeFile(booksPath, JSON.stringify(idempotentRecords, null, 2), 'utf-8');
  await fs.writeFile(errorsPath, JSON.stringify(errorRecords, null, 2), 'utf-8');

  return {
    savedCount: idempotentRecords.length,
    errorCount: errorRecords.length
  };
}