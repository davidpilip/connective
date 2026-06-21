# Director Matcher

A semantic search application to match project briefs with directors from a database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Extract director data from Excel:**
   ```bash
   npm run etl
   ```

4. **Generate embeddings:**
   ```bash
   npm run embed
   ```
   Note: This will call the OpenAI API for each director, which may take a few minutes and incur API costs.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter a project brief describing what you're looking for in a director
2. Optionally upload a .txt or .pdf script file for better matching
3. Click "Find Directors" to see the top 12 matches
4. Results include:
   - Director name and genre
   - Top specialty tags
   - Location
   - Links to website, Vimeo, and email (from Excel hyperlinks)
   - Match score and reasoning

## Project Structure

```
/app
  /api
    /upload/route.ts       # File upload endpoint
    /search/route.ts       # Search endpoint
  page.tsx                 # Main UI
  layout.tsx               # App layout
/components
  ResultCard.tsx           # Director result card
/data
  DIRECTOR DATABASE MASTER (2).xlsm  # Source Excel file
  directors.json                      # Extracted director data
  directors.embeddings.json           # Director embeddings
/lib
  embeddings.ts            # Embedding utilities
  scoring.ts               # Ranking algorithm
/scripts
  etl_directors.ts         # Extract director data
  embed_directors.ts       # Generate embeddings
```

## How It Works

1. **ETL**: Extracts director data from Excel, normalizes specialty tags, and preserves hyperlinks
2. **Embeddings**: Creates semantic vectors for each director using OpenAI's text-embedding-3-large
3. **Search**: Combines user brief + optional script, creates embedding, and ranks directors by:
   - 85% cosine similarity
   - +8% genre match
   - +5% per specialty match (max +15%)
   - +5% brand/industry match
   - -3% if not a director position

## Technologies

- Next.js 14 (App Router)
- TypeScript
- OpenAI text-embedding-3-large
- SheetJS (xlsx) for Excel parsing
- pdf-parse for PDF text extraction
- Zod for validation





