# Backend API

Node.js backend with Express, Prisma, and PostgreSQL.

## Structure

```
backend/
├── src/
│   ├── config/        # Configuration files (database, etc.)
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic layer
│   ├── utils/         # Utility functions
│   ├── scripts/       # Utility scripts
│   └── server.js      # Entry point
├── prisma/            # Prisma schema and migrations
└── data/              # Scraped data (JSON files)
```

## Scholarship Scraper

The backend includes a web scraper for ScholarshipsCanada.com.

### Quick Test

```bash
npm run scrape:test
```

This will:
1. Scrape scholarships from ScholarshipsCanada.com
2. Save results to `data/scholarships.json`

**If Puppeteer fails** (common on macOS), use Cheerio mode:
```bash
npm run scrape:test:cheerio
```

Or set the environment variable:
```bash
FORCE_CHEERIO=true npm run scrape:test
```

### API Endpoints

- `GET /api/scraper/run` - Start scraping (async, returns immediately)
- `GET /api/scraper/run-sync` - Start scraping (sync, waits for completion)

### Output Format

The scraper saves data in the following format:

```json
{
  "metadata": {
    "totalScholarships": 10,
    "scrapedAt": "2024-01-01T00:00:00.000Z",
    "source": "https://www.scholarshipscanada.com"
  },
  "scholarships": [
    {
      "id": 1,
      "title": "Scholarship Name",
      "url": "https://www.scholarshipscanada.com/...",
      "description": "...",
      "amount": "$5,000",
      "deadline": "March 15, 2024",
      "scrapedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Future: Cron Job

To convert this to a cron job, you can:

1. **Using node-cron** (recommended for Node.js):
   ```bash
   npm install node-cron
   ```
   Then add scheduling in `server.js`

2. **Using system cron**:
   ```bash
   # Add to crontab (runs daily at 2 AM)
   0 2 * * * cd /path/to/backend && node src/scripts/test-scraper.js
   ```

3. **Using API endpoint with external scheduler**:
   - Set up a cron job that calls `http://localhost:3001/api/scraper/run`

