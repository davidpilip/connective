# Quick Setup Guide

## 1. Create `.env.local` file

Create a file named `.env.local` in the root directory with your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important:** Replace `sk-your-actual-api-key-here` with your actual OpenAI API key.

## 2. Install and Run

```bash
# Install dependencies
npm install

# Extract director data from Excel
npm run etl

# Generate embeddings (this will use OpenAI API)
npm run embed

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### "OPENAI_API_KEY not set" error
Make sure you've created `.env.local` (not `.env.example`) with your actual API key.

### "File not found" error
Run `npm run etl` first to extract the director data from the Excel file.

### "Embeddings file not found" error
Run `npm run embed` to generate the embeddings before starting the dev server.

### Excel file issues
The Excel file should be at: `data/DIRECTOR DATABASE MASTER (2).xlsm`

