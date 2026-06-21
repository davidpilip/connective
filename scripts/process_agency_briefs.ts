import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import OpenAI from 'openai';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

interface BriefAnalysis {
  filename: string;
  brand: string;
  text: string;
  vibe: string;
  genre: string[];
  specialties: string[];
  tone: string;
  style: string;
  vector: number[];
}

const BRIEFS_DIR = path.resolve(process.cwd(), 'AGENCY BRIEFS 2');
const OUTPUT_PATH = path.resolve(process.cwd(), 'data', 'agency_briefs.json');

async function analyzeBriefVibe(text: string, brand: string): Promise<{
  vibe: string;
  genre: string[];
  specialties: string[];
  tone: string;
  style: string;
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `Analyze this agency brief for ${brand} and extract:
1. Overall vibe/mood (e.g., "luxury", "energetic", "intimate", "cinematic", "playful")
2. Genre categories (e.g., STORYTELLING, BEAUTY, FASHION, LIFESTYLE, CAR, DANCE, SPORTS, MUSIC, DOCUMENTARY, ACTION, COMEDY)
3. Specialty tags (e.g., "vfx", "celebrities", "lifestyle", "beauty", "automotive", "food", "family", "kids", "performance", "talking on camera")
4. Tone (e.g., "serious", "playful", "emotional", "humorous", "inspirational", "dramatic")
5. Visual style (e.g., "high-end", "naturalistic", "stylized", "gritty", "polished", "documentary", "conceptual")

Brief text:
${text.slice(0, 3000)}

Return JSON format:
{
  "vibe": "brief description",
  "genre": ["GENRE1", "GENRE2"],
  "specialties": ["specialty1", "specialty2", "specialty3"],
  "tone": "tone description",
  "style": "style description"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return {
      vibe: analysis.vibe || '',
      genre: Array.isArray(analysis.genre) ? analysis.genre : [analysis.genre].filter(Boolean),
      specialties: Array.isArray(analysis.specialties) ? analysis.specialties : [analysis.specialties].filter(Boolean),
      tone: analysis.tone || '',
      style: analysis.style || '',
    };
  } catch (error) {
    console.error(`Error analyzing brief for ${brand}:`, error);
    return {
      vibe: '',
      genre: [],
      specialties: [],
      tone: '',
      style: '',
    };
  }
}

async function createEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  });

  return response.data[0].embedding;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  console.log('Processing agency briefs from:', BRIEFS_DIR);

  if (!fs.existsSync(BRIEFS_DIR)) {
    console.error(`ERROR: Directory not found: ${BRIEFS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(BRIEFS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${files.length} PDF files`);

  const briefs: BriefAnalysis[] = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(BRIEFS_DIR, filename);
    const brand = filename.replace('.pdf', '').replace(/\s+/g, ' ').trim();

    console.log(`[${i + 1}/${files.length}] Processing ${brand}...`);

    try {
      // Read and parse PDF
      const buffer = fs.readFileSync(filePath);
      const data = await pdf(buffer);
      const text = data.text.trim();

      if (!text) {
        console.warn(`  ⚠️  No text extracted from ${filename}`);
        continue;
      }

      console.log(`  📄 Extracted ${text.length} characters`);

      // Analyze vibe
      console.log(`  🔍 Analyzing vibe...`);
      const analysis = await analyzeBriefVibe(text, brand);
      
      // Create embedding
      console.log(`  🧮 Creating embedding...`);
      const vector = await createEmbedding(text);

      briefs.push({
        filename,
        brand,
        text,
        vibe: analysis.vibe,
        genre: analysis.genre,
        specialties: analysis.specialties,
        tone: analysis.tone,
        style: analysis.style,
        vector,
      });

      console.log(`  ✓ Processed ${brand}`);
      console.log(`    Vibe: ${analysis.vibe}`);
      console.log(`    Genres: ${analysis.genre.join(', ')}`);
      console.log(`    Specialties: ${analysis.specialties.join(', ')}`);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Error processing ${filename}:`, error);
    }
  }

  console.log(`\nProcessed ${briefs.length} briefs`);

  // Save to file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(briefs, null, 2));
  console.log(`Saved to ${OUTPUT_PATH}`);
}

main().catch(console.error);

