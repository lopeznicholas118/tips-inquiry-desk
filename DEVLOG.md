# Development Log – Inquiry Desk with AI

## September 28th, 2026

### Edited 

## September 27th, 2026

### Pushed the UI onto github using Vercel

### Changed the database from better-sqlite3 to libSQL for others to access the inquiry desk

## September 26th, 2026

### Implemented UI with Node.js through localhost to connect inquiry submission and staff inbox to a functional website

### Identified ' for \`&apos\` error in both ReviewPanel.tsx and submit/page.tsx and changed it

### Language mismatch occurence – fixed draft replies that were in Spanish even if the inquiry was in English

### STRETCH GOAL: Full component tests for UI with a jsdom environment

## September 25th, 2026

### Developed the intake using Anthropic API Keys

### Developed the customer inquiry 

### Disabled file parallelism to avoid SQLite lock contention in tests

### Troubleshooted AI generated code which utilized depreciated Zod code – changed to Zod v4

## September 24th, 2026

### Developed the AI triage layer

### Wrote the system prompt

### Troubleshooted .dotenv error and utilized --env-file for smoke-triage.ts to access

## September 23rd, 2026

### Created the project files

### Created the DB client and defined the workflow state machine

### Wrote the first tests using Vitest

## September 22nd, 2026

### Downloaded all dependencies for the project

### Bumped @types/node to satisy vitest's peer requirement