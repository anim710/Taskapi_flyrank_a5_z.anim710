import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG } from './config.js';

export async function generateReport(stats) {
  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
  const reportPath = path.join(CONFIG.OUTPUT_DIR, 'run-report.json');

  const report = {
    start_time: stats.startTime,
    end_time: new Date().toISOString(),
    duration_ms: Date.now() - new Date(stats.startTime).getTime(),
    pages_fetched: stats.pagesFetched,
    cache_hits: stats.cacheHits,
    valid_records: stats.validRecords,
    invalid_records: stats.invalidRecords,
    failed_pages: stats.failedPages.length,
    failed_urls: stats.failedPages
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  return report;
}