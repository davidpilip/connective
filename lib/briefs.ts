import * as fs from 'fs';
import * as path from 'path';
import { cosineSimilarity } from './embeddings';

export interface BriefAnalysis {
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

let cachedBriefs: BriefAnalysis[] | null = null;

export function loadAgencyBriefs(): BriefAnalysis[] {
  if (cachedBriefs) {
    return cachedBriefs;
  }

  const briefsPath = path.resolve(process.cwd(), 'data', 'agency_briefs.json');

  if (!fs.existsSync(briefsPath)) {
    console.warn('Agency briefs file not found. Run "npm run process-briefs" first.');
    return [];
  }

  cachedBriefs = JSON.parse(fs.readFileSync(briefsPath, 'utf-8'));
  return cachedBriefs;
}

export interface ScoredBrief {
  brand: string;
  filename: string;
  vibe: string;
  genre: string[];
  specialties: string[];
  tone: string;
  style: string;
  similarity: number;
  textSnippet: string;
}

/**
 * Find the most similar agency briefs to a query
 * This helps understand the vibe/style/tone the user is looking for
 */
export function findSimilarBriefs(
  queryVector: number[],
  limit: number = 3
): BriefAnalysis[] {
  const briefs = loadAgencyBriefs();
  
  if (briefs.length === 0) {
    return [];
  }

  const scored = briefs.map(brief => ({
    brief,
    similarity: cosineSimilarity(brief.vector, queryVector),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, limit).map(s => s.brief);
}

/**
 * Find the most similar agency briefs and return them with scores
 * Used for the Top Pick recommendation panel
 */
export function findSimilarBriefsWithScores(
  queryVector: number[],
  limit: number = 3
): ScoredBrief[] {
  const briefs = loadAgencyBriefs();
  
  if (briefs.length === 0) {
    return [];
  }

  const scored = briefs.map(brief => ({
    brand: brief.brand,
    filename: brief.filename,
    vibe: brief.vibe,
    genre: brief.genre,
    specialties: brief.specialties,
    tone: brief.tone,
    style: brief.style,
    similarity: cosineSimilarity(brief.vector, queryVector),
    textSnippet: brief.text.slice(0, 200).trim(),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, limit);
}

/**
 * Extract vibe signals from similar briefs
 * This enhances the query understanding based on real agency briefs
 */
export function extractVibeFromBriefs(
  queryVector: number[],
  queryText: string
): {
  enhancedGenres: string[];
  enhancedSpecialties: string[];
  vibeKeywords: string[];
  tone: string;
  style: string;
} {
  const similarBriefs = findSimilarBriefs(queryVector, 3);

  if (similarBriefs.length === 0) {
    return {
      enhancedGenres: [],
      enhancedSpecialties: [],
      vibeKeywords: [],
      tone: '',
      style: '',
    };
  }

  // Collect all genres and specialties from similar briefs
  const allGenres = new Set<string>();
  const allSpecialties = new Set<string>();
  const vibeKeywords: string[] = [];
  const tones: string[] = [];
  const styles: string[] = [];

  similarBriefs.forEach(brief => {
    brief.genre.forEach(g => allGenres.add(g));
    brief.specialties.forEach(s => allSpecialties.add(s));
    if (brief.vibe) vibeKeywords.push(brief.vibe);
    if (brief.tone) tones.push(brief.tone);
    if (brief.style) styles.push(brief.style);
  });

  // Get most common tone and style
  const toneCounts: Record<string, number> = {};
  tones.forEach(t => { toneCounts[t] = (toneCounts[t] || 0) + 1; });
  const mostCommonTone = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  const styleCounts: Record<string, number> = {};
  styles.forEach(s => { styleCounts[s] = (styleCounts[s] || 0) + 1; });
  const mostCommonStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    enhancedGenres: Array.from(allGenres),
    enhancedSpecialties: Array.from(allSpecialties),
    vibeKeywords: [...new Set(vibeKeywords)],
    tone: mostCommonTone,
    style: mostCommonStyle,
  };
}




