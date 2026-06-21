import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

interface Director {
  id: string;
  name: string;
  position: string;
  genre: string;
  specialty: string[];
  brands: string[];
  industry: string[];
  location: string;
  notes: string;
  urls: {
    website?: string;
    vimeo?: string;
    email?: string;
  };
  profile_text: string;
}

interface EmbeddedDirector {
  id: string;
  vector: number[];
  name: string;
  genre: string;
  specialty: string[];
  brands: string[];
  industry: string[];
  position: string;
  location: string;
  urls: {
    website?: string;
    vimeo?: string;
    email?: string;
  };
}

const INPUT_PATH = path.resolve(process.cwd(), 'data', 'directors.json');
const OUTPUT_PATH = path.resolve(process.cwd(), 'data', 'directors.embeddings.json');

async function main() {
  const force = process.argv.includes('--force');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  console.log('Loading directors from:', INPUT_PATH);
  
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`ERROR: File not found at ${INPUT_PATH}`);
    console.error('Run "npm run etl" first to extract director data');
    process.exit(1);
  }
  
  const directors: Director[] = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  console.log(`Loaded ${directors.length} directors`);
  
  // Load existing embeddings if available
  let existingEmbeddings: Map<string, EmbeddedDirector> = new Map();
  if (!force && fs.existsSync(OUTPUT_PATH)) {
    const existing: EmbeddedDirector[] = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    existingEmbeddings = new Map(existing.map(e => [e.id, e]));
    console.log(`Found ${existingEmbeddings.size} existing embeddings`);
  }
  
  const embeddedDirectors: EmbeddedDirector[] = [];
  let newEmbeddingsCount = 0;
  
  for (let i = 0; i < directors.length; i++) {
    const director = directors[i];
    
    // Check if already embedded
    if (existingEmbeddings.has(director.id)) {
      embeddedDirectors.push(existingEmbeddings.get(director.id)!);
      console.log(`[${i + 1}/${directors.length}] Skipping ${director.name} (already embedded)`);
      continue;
    }
    
    console.log(`[${i + 1}/${directors.length}] Embedding ${director.name}...`);
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: director.profile_text,
      });
      
      const vector = response.data[0].embedding;
      
      embeddedDirectors.push({
        id: director.id,
        vector,
        name: director.name,
        genre: director.genre,
        specialty: director.specialty,
        brands: director.brands,
        industry: director.industry,
        position: director.position,
        location: director.location,
        urls: director.urls,
      });
      
      newEmbeddingsCount++;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error embedding ${director.name}:`, error);
      throw error;
    }
  }
  
  console.log(`\nGenerated ${newEmbeddingsCount} new embeddings`);
  console.log(`Total embeddings: ${embeddedDirectors.length}`);
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(embeddedDirectors, null, 2));
  console.log(`Saved to ${OUTPUT_PATH}`);
}

main().catch(console.error);


