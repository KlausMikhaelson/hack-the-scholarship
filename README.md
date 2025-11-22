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

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: Next.js, React, TailwindCSS
- **Browser Extension**: Chrome/Edge Extension API

