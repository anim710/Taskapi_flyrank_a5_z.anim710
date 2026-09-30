# Polite Scraper - FlyRank Internship W5-A9

A polite, resilient web scraping pipeline built in Node.js for Books to Scrape.

## Target Classification
- **Target Site:** Books to Scrape (https://books.toscrape.com)
- **Scope:** First 3 catalogue pages (~60 book records)
- **Data Collected:** Title, Product URL, Raw Price, Numeric Price (GBP), Availability, Star Rating, Description, Source Page, Fetch Timestamp
- **Permission:** Explicit sandbox built for web scraping practice
- **Robots.txt Check:** Requested `https://books.toscrape.com/robots.txt` -> Result: `no robots file found` (HTTP 404)

> **Ethics Statement:** Use official APIs when available. Never bypass logins, paywalls, or rate blocks. Collect only necessary data. I will not reuse this code on another site without checking its rules and terms first.

---

## Quick Start (Run in under 5 minutes)

### Prerequisites
- Node.js 20+

### Installation & Execution
```bash
# 1. Clone repo
git clone <your-repo-url>
cd scraper

# 2. Install dependencies
npm install

# 3. Run scraper
npm start


Pipeline Architecture & Politeness Rules
Identifying User-Agent: Sends FlyRankInternship-A9/1.0 (+link-to-repo).

Rate Limiting: Minimum 500 ms delay between network requests.

Timeout Safeguard: Requests timeout automatically after 5 seconds (AbortController).

Caching Layer: Local cache under cache/ prevents hitting the live server repeatedly during development.

Validation: Zod schema validation checks types before writing records to output/books.json.

Error Resiliency: Non-200 responses and missing elements are handled gracefully without terminating the run.


Record Schema:
type BookRecord = {
  title: string;
  product_url: string; // Canonical URL
  price_text: string;  // e.g., "£51.77"
  price_gbp: number;   // e.g., 51.77
  availability_text: string;
  rating_text: string;
  description: string | null;
  source_page: string; // Provenance
  fetched_at: string;  // ISO Timestamp
 };

Sample Run Report (output/run-report.json)
{
  "start_time": "2026-08-23T12:00:00.000Z",
  "end_time": "2026-08-23T12:00:05.123Z",
  "duration_ms": 5123,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0,
  "failed_urls": []
}

Browser Cost Note
This project requires no headless browser (e.g., Playwright or Puppeteer) because all data is directly embedded in the static HTML payload returned by the server. Using a browser would introduce unnecessary CPU, RAM, and time overhead without benefit.

Honest Limitations
Designed specifically for static server-rendered HTML markup.

Pagination assumes the presence of standard .pager .next a DOM elements.