import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

export interface EmbeddedDirector {
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

let cachedDirectors: EmbeddedDirector[] | null = null;

export function loadDirectorEmbeddings(): EmbeddedDirector[] {
  if (cachedDirectors) {
    return cachedDirectors;
  }
  
  const embeddingsPath = path.resolve(process.cwd(), 'data', 'directors.embeddings.json');
  
  if (!fs.existsSync(embeddingsPath)) {
    throw new Error('Embeddings file not found. Run "npm run embed" first.');
  }
  
  cachedDirectors = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));
  return cachedDirectors;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

export async function createEmbedding(text: string): Promise<number[]> {
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

export async function analyzeImageVibe(imageBase64: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this storyboard frame or creative image. Describe the overall vibe, mood, visual style, tone, and directorial approach. Focus on:
- Visual aesthetic (cinematic, naturalistic, stylized, gritty, polished, etc.)
- Mood and emotion (uplifting, dramatic, intimate, energetic, contemplative, etc.)
- Tone (serious, playful, emotional, humorous, inspirational, etc.)
- Production style (high-end, documentary, lifestyle, conceptual, performance, etc.)
- Color palette and lighting feel
- Any specific creative techniques or approaches

Be concise but descriptive. Use language that helps match to a director's sensibility and style.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    max_tokens: 500
  });
  
  return response.choices[0].message.content || '';
}

export interface VibeAnalysis {
  vibe: string;
  cinematicKnowHow: string;
  themes: string[];
  genre: string[];
  specialties: string[];
  tone: string;
  visualStyle: string;
}

export async function analyzeProjectVibe(
  brief: string,
  fileContent?: string
): Promise<VibeAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const combinedContent = fileContent 
    ? `${brief}\n\n--- Additional Context from Files ---\n${fileContent}`
    : brief;

  const prompt = `Analyze this project brief and determine what type of director is needed. Provide a comprehensive analysis in JSON format:

{
  "vibe": "Overall mood and energy (e.g., 'luxury and sophisticated', 'energetic and playful', 'intimate and emotional')",
  "cinematicKnowHow": "Specific cinematic skills and techniques required (e.g., 'VFX-heavy action sequences', 'documentary-style authenticity', 'high-end beauty cinematography', 'dynamic camera movement')",
  "themes": ["theme1", "theme2", "theme3"] - Key themes and concepts (e.g., ["sustainability", "diversity", "performance"], ["luxury", "heritage", "craftsmanship"]),
  "genre": ["GENRE1", "GENRE2"] - From: STORYTELLING, DANCE, CAR, BEAUTY, FASHION, LIFESTYLE, SPORTS, MUSIC, DOCUMENTARY, ACTION, COMEDY,
  "specialties": ["specialty1", "specialty2"] - Required director specialties (e.g., ["vfx", "celebrities", "lifestyle"], ["automotive", "stunt", "cinematic"]),
  "tone": "Overall tone (e.g., 'serious and inspirational', 'playful and energetic', 'intimate and emotional')",
  "visualStyle": "Visual aesthetic description (e.g., 'high-end polished', 'naturalistic documentary', 'stylized and cinematic', 'gritty and authentic')"
}

Brief:
${combinedContent.slice(0, 4000)}`;

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
      max_tokens: 800,
    });

    const rawContent = response.choices[0].message.content || '{}';
    console.log('[VIBE DEBUG] Raw GPT response length:', rawContent.length);
    console.log('[VIBE DEBUG] Raw GPT response:', rawContent.slice(0, 300));
    console.log('[VIBE DEBUG] Finish reason:', response.choices[0].finish_reason);
    
    const analysis = JSON.parse(rawContent);
    console.log('[VIBE DEBUG] Parsed keys:', Object.keys(analysis));
    
    return {
      vibe: analysis.vibe || '',
      cinematicKnowHow: analysis.cinematicKnowHow || '',
      themes: Array.isArray(analysis.themes) ? analysis.themes : [analysis.themes].filter(Boolean),
      genre: Array.isArray(analysis.genre) ? analysis.genre : [analysis.genre].filter(Boolean),
      specialties: Array.isArray(analysis.specialties) ? analysis.specialties : [analysis.specialties].filter(Boolean),
      tone: analysis.tone || '',
      visualStyle: analysis.visualStyle || '',
    };
  } catch (error) {
    console.error('Error analyzing project vibe:', error instanceof Error ? error.message : error);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2));
    return {
      vibe: '',
      cinematicKnowHow: '',
      themes: [],
      genre: [],
      specialties: [],
      tone: '',
      visualStyle: '',
    };
  }
}


