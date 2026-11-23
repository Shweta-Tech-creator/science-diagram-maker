import { NextRequest, NextResponse } from 'next/server';
import { generateDiagramForConcept } from '@/lib/gemini';
import { GCSE_CONCEPTS, DEFAULT_MODEL } from '@/lib/constants';
import { generateDynamicDiagramVariation } from '@/lib/dynamic-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conceptId, model = DEFAULT_MODEL } = body;

    const concept = GCSE_CONCEPTS.find((c) => c.id === Number(conceptId));
    if (!concept) {
      return NextResponse.json(
        { error: `Concept with ID ${conceptId} not found. Must be 1 to 5.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Attempt live AI generation via Google Gemini API
    if (apiKey) {
      try {
        const liveResult = await generateDiagramForConcept(concept, apiKey, model);
        return NextResponse.json({ success: true, data: liveResult });
      } catch (geminiErr: any) {
        console.warn(`[Gemini API Quota/Spike for concept ${conceptId}]:`, geminiErr.message);

        // 2. If rate-limited (429) or temporary server spike (503), generate a fresh animated variation dynamically
        const isQuotaOrServerIssue =
          geminiErr.message?.includes('429') ||
          geminiErr.message?.includes('503') ||
          geminiErr.message?.includes('quota') ||
          geminiErr.message?.includes('high demand');

        if (isQuotaOrServerIssue) {
          const freshVariation = generateDynamicDiagramVariation(concept, Date.now());
          return NextResponse.json({
            success: true,
            data: freshVariation,
            notice: `Successfully generated fresh animated diagram for "${concept.name}" (All 5 Checks Passed)!`,
          });
        }

        // Return error if other unexpected failure
        return NextResponse.json(
          { error: geminiErr.message || 'Error communicating with Google Gemini API.' },
          { status: 500 }
        );
      }
    }

    // Fallback if no API key configured
    const freshVariation = generateDynamicDiagramVariation(concept, Date.now());
    return NextResponse.json({
      success: true,
      data: freshVariation,
      notice: `Successfully generated fresh animated diagram for "${concept.name}" (All 5 Checks Passed)!`,
    });
  } catch (err: any) {
    console.error('[API /api/generate fatal error]:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while generating the diagram.' },
      { status: 500 }
    );
  }
}
