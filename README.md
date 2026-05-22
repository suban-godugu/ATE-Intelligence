# ATE Intelligence Platform

Industrial-grade semiconductor test analysis platform featuring AI-powered diagnostics and visualization.

## Monorepo Structure

- `frontend/`: React + Vite dashboard for data visualization.
- `backend/`: Express + Prisma API serving forensic data and orchestration.
- `ai-models/`: TypeScript-based AI model library for STIL/Log parsing and pattern analysis.

## Getting Started

1. Install dependencies from the root:
   ```bash
   npm install
   ```

2. Run the development environment:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts both backend and frontend concurrently.
- `npm run dev:frontend`: Starts only the frontend.
- `npm run dev:backend`: Starts only the backend.
- `npm run dev:ai`: Runs the AI models package.

## Architecture

- **Backend** orchestrates data ingestion and calls **ai-models** for analysis.
- **Frontend** consumes REST endpoints from the **backend**.
- **AI Models** package is isolated and exported as a workspace dependency.
