# HackTheScholarship

Full-stack application with Node.js backend, Next.js frontend, and browser extension.

## Project Structure

```
hackthescholarship/
├── backend/          # Node.js backend with Prisma & PostgreSQL
├── frontend/         # Next.js application with TailwindCSS
├── browser-extension/ # Browser extension
└── package.json      # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
- Copy `backend/.env.example` to `backend/.env` and add your PostgreSQL connection string
- Copy `frontend/.env.example` to `frontend/.env` if needed

3. Set up Prisma:
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### Development

Run backend and frontend concurrently:
```bash
npm run dev
```

Or run individually:
```bash
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

## Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL, Puppeteer (for scraping)
- **Frontend**: Next.js, React, TailwindCSS
- **Browser Extension**: Chrome/Edge Extension API

## Browser Extension

The browser extension allows users to automatically fill scholarship application forms with their profile data.

### Quick Setup

1. **Install dependencies**:
   ```bash
   cd browser-extension
   npm install
   ```

2. **Load extension in browser**:
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select the `browser-extension` folder
   - **Edge**: Go to `edge://extensions/`, enable "Developer mode", click "Load unpacked", select the `browser-extension` folder

3. **Sign in and use**:
   - Click the extension icon
   - Sign in with your Scholarly account
   - Navigate to a scholarship application form
   - Click "Fill Form" to auto-fill the form

For detailed instructions, see [browser-extension/README.md](./browser-extension/README.md)

## Scholarship Scraper

The backend includes a scholarship scraper for ScholarshipsCanada.com.

### Testing the Scraper

1. **Via API endpoint** (async):
   ```bash
   curl http://localhost:3001/api/scraper/run
   ```

2. **Via API endpoint** (sync - waits for completion):
   ```bash
   curl http://localhost:3001/api/scraper/run-sync
   ```

3. **Via test script**:
   ```bash
   cd backend
   node src/scripts/test-scraper.js
   ```

The scraped data will be saved to `backend/data/scholarships.json`.

### Future: Cron Job Setup

To set up as a cron job, you can:
- Use `node-cron` package for in-process scheduling
- Use system cron to call the API endpoint
- Use a task scheduler service

