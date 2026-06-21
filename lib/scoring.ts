import { EmbeddedDirector, cosineSimilarity } from './embeddings';
import { extractVibeFromBriefs } from './briefs';

export interface ScoredDirector {
  id: string;
  name: string;
  genre: string;
  topTags: string[];
  location: string;
  urls: {
    website?: string;
    vimeo?: string;
    email?: string;
  };
  score: number;
  reason: string;
}

// Extract keywords from query text for matching
function extractQueryKeywords(queryText: string): {
  words: string[];
  genres: string[];
  specialties: string[];
  brands: string[];
  industries: string[];
} {
  const lowerText = queryText.toLowerCase();
  const words = lowerText
    .split(/\s+/)
    .map(w => w.replace(/[^\w]/g, ''))
    .filter(w => w.length > 2);
  
  // Common genre keywords
  const genreKeywords = [
    'comedy', 'drama', 'action', 'lifestyle', 'beauty', 'fashion',
    'storytelling', 'documentary', 'sports', 'music', 'dance',
    'cinematic', 'naturalistic', 'stylized', 'conceptual'
  ];
  
  // Common specialty keywords
  const specialtyKeywords = [
    'vfx', 'cgi', 'animation', 'motion', 'graphics', 'performance',
    'talking', 'interview', 'testimonial', 'celebrities', 'talent',
    'car', 'automotive', 'food', 'tabletop', 'product', 'beauty',
    'fashion', 'lifestyle', 'kids', 'family', 'animals', 'pets'
  ];
  
  // Common brand/industry keywords
  const brandIndustryKeywords = [
    'automotive', 'car', 'luxury', 'fashion', 'beauty', 'cosmetics',
    'food', 'beverage', 'soda', 'drink', 'tech', 'technology',
    'pharma', 'healthcare', 'finance', 'banking', 'retail'
  ];
  
  const genres = genreKeywords.filter(kw => lowerText.includes(kw));
  const specialties = specialtyKeywords.filter(kw => lowerText.includes(kw));
  const brands = brandIndustryKeywords.filter(kw => lowerText.includes(kw));
  const industries = brands; // Same keywords apply
  
  return { words, genres, specialties, brands, industries };
}

// Check if query matches a director's genre
function matchesGenre(queryGenres: string[], directorGenre: string): boolean {
  if (!directorGenre) return false;
  const dirGenre = directorGenre.toLowerCase();
  return queryGenres.some(qg => dirGenre.includes(qg) || qg.includes(dirGenre));
}

// Count specialty matches
function countSpecialtyMatches(querySpecialties: string[], directorSpecialties: string[]): number {
  if (!directorSpecialties || directorSpecialties.length === 0) return 0;
  
  const dirSpecs = directorSpecialties.map(s => s.toLowerCase());
  return querySpecialties.filter(qs => 
    dirSpecs.some(ds => ds.includes(qs) || qs.includes(ds))
  ).length;
}

// Check if query matches brands or industries
function matchesBrandOrIndustry(
  queryBrands: string[],
  queryIndustries: string[],
  directorBrands: string[],
  directorIndustries: string[]
): boolean {
  const allQuery = [...queryBrands, ...queryIndustries];
  const allDirector = [
    ...(directorBrands || []).map(b => b.toLowerCase()),
    ...(directorIndustries || []).map(i => i.toLowerCase())
  ];
  
  return allQuery.some(q => 
    allDirector.some(d => d.includes(q) || q.includes(d))
  );
}

export function rankDirectors(
  directors: EmbeddedDirector[],
  queryVector: number[],
  queryText: string
): ScoredDirector[] {
  // Extract keywords from query for matching
  const queryKeywords = extractQueryKeywords(queryText);
  
  // Enhance understanding using agency briefs for vibe matching
  const briefVibes = extractVibeFromBriefs(queryVector, queryText);
  
  // Merge brief insights with query keywords
  const enhancedGenres = [...new Set([...queryKeywords.genres, ...briefVibes.enhancedGenres])];
  const enhancedSpecialties = [...new Set([...queryKeywords.specialties, ...briefVibes.enhancedSpecialties])];
  
  const scored = directors.map(director => {
    // 85% base: Cosine similarity (semantic match)
    const cosineSim = cosineSimilarity(director.vector, queryVector);
    const baseScore = cosineSim * 0.85;
    
    // +8% genre match (enhanced with brief analysis)
    let genreBonus = 0;
    if (matchesGenre(enhancedGenres, director.genre)) {
      genreBonus = 0.08;
    }
    
    // +5% per specialty match (max +15%) - enhanced with brief analysis
    const specialtyMatches = countSpecialtyMatches(
      enhancedSpecialties,
      director.specialty || []
    );
    const specialtyBonus = Math.min(specialtyMatches * 0.05, 0.15);
    
    // Additional bonus if vibe keywords match (from brief analysis)
    let vibeBonus = 0;
    if (briefVibes.vibeKeywords.length > 0) {
      const vibeMatch = briefVibes.vibeKeywords.some(vibe => 
        director.specialty?.some(s => s.toLowerCase().includes(vibe.toLowerCase()) || vibe.toLowerCase().includes(s.toLowerCase()))
      );
      if (vibeMatch) vibeBonus = 0.03;
    }
    
    // +5% brand/industry match
    let brandIndustryBonus = 0;
    if (matchesBrandOrIndustry(
      queryKeywords.brands,
      queryKeywords.industries,
      director.brands || [],
      director.industry || []
    )) {
      brandIndustryBonus = 0.05;
    }
    
    // -3% if not a director position
    let positionPenalty = 0;
    if (director.position && !director.position.toLowerCase().includes('director')) {
      positionPenalty = 0.03;
    }
    
    // Calculate final score (normalized to 0-1 range)
    const finalScore = Math.min(1, Math.max(0, 
      baseScore + genreBonus + specialtyBonus + brandIndustryBonus + vibeBonus - positionPenalty
    ));
    
    // Generate human-readable reason
    const matchParts: string[] = [];
    if (genreBonus > 0) matchParts.push('genre match');
    if (specialtyBonus > 0) matchParts.push(`${specialtyMatches} specialty match${specialtyMatches > 1 ? 'es' : ''}`);
    if (brandIndustryBonus > 0) matchParts.push('brand/industry match');
    if (positionPenalty > 0) matchParts.push('non-director');
    
    const semanticPercent = (cosineSim * 100).toFixed(0);
    const reason = matchParts.length > 0
      ? `${semanticPercent}% semantic • ${matchParts.join(', ')}`
      : `${semanticPercent}% semantic match`;
    
    return {
      id: director.id,
      name: director.name,
      genre: director.genre,
      topTags: (director.specialty || []).slice(0, 6),
      location: director.location,
      urls: director.urls,
      score: finalScore,
      reason,
    };
  });
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  return scored;
}


