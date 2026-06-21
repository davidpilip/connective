import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loadDirectorEmbeddings, createEmbedding, analyzeProjectVibe } from '@/lib/embeddings';
import { rankDirectors } from '@/lib/scoring';
import { findSimilarBriefsWithScores } from '@/lib/briefs';
import OpenAI from 'openai';

const searchSchema = z.object({
  query: z.string().min(1),
  fileText: z.string().optional(),
});

async function generateTopPickReason(
  query: string,
  directorName: string,
  directorGenre: string,
  directorTags: string[],
  directorLocation: string,
  matchScore: number,
  vibeAnalysis: { vibe: string; tone: string; visualStyle: string; themes: string[] },
  similarBriefs: { brand: string; vibe: string; tone: string }[],
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return '';

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `You are a creative director matchmaker. In 2-3 concise sentences, explain why "${directorName}" is the #1 recommended director for this project. Be specific about what makes them the ideal fit.

Project brief: "${query}"
Project vibe: ${vibeAnalysis.vibe || 'N/A'}
Project tone: ${vibeAnalysis.tone || 'N/A'}
Visual style needed: ${vibeAnalysis.visualStyle || 'N/A'}
Key themes: ${vibeAnalysis.themes?.join(', ') || 'N/A'}

Director details:
- Name: ${directorName}
- Genre: ${directorGenre}
- Specialties: ${directorTags.join(', ')}
- Location: ${directorLocation}
- Match score: ${(matchScore * 100).toFixed(0)}%

Similar past briefs from brands: ${similarBriefs.map(b => b.brand).join(', ')}

Write a compelling, specific recommendation. Focus on the alignment between the project needs and the director's strengths.`,
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || '';
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, fileText } = searchSchema.parse(body);
    
    // Combine query and file text
    const combinedText = fileText 
      ? `${query}\n\n${fileText}`
      : query;
    
    // Analyze project vibe (multimodal analysis)
    const vibeAnalysis = await analyzeProjectVibe(query, fileText);
    
    // Load director embeddings
    const directors = loadDirectorEmbeddings();
    
    // Create embedding for the search query
    const queryVector = await createEmbedding(combinedText);
    
    // Rank directors
    const rankedDirectors = rankDirectors(directors, queryVector, combinedText);
    
    // Return top 12
    const top12 = rankedDirectors.slice(0, 12);

    // Find similar agency briefs
    const similarBriefs = findSimilarBriefsWithScores(queryVector, 3);

    // Generate a GPT explanation for the top pick
    let topPickReason = '';
    if (top12.length > 0) {
      const topDirector = top12[0];
      topPickReason = await generateTopPickReason(
        query,
        topDirector.name,
        topDirector.genre,
        topDirector.topTags,
        topDirector.location,
        topDirector.score,
        vibeAnalysis,
        similarBriefs,
      );
    }
    
    return NextResponse.json({ 
      results: top12,
      vibeAnalysis,
      similarBriefs,
      topPickReason,
    });
  } catch (error) {
    console.error('Search error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}





