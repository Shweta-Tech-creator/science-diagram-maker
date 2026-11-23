import { NextRequest, NextResponse } from 'next/server';
import { generateDiagramForConcept } from '@/lib/gemini';
import { GCSE_CONCEPTS, DEFAULT_MODEL } from '@/lib/constants';
import verifiedResults from '@/data/results.json';
import { DiagramResult } from '@/types/diagram';

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

    // Try generating live via Gemini API
    if (apiKey) {
      try {
        const result = await generateDiagramForConcept(concept, apiKey, model);
        return NextResponse.json({ success: true, data: result });
      } catch (geminiErr: any) {
        console.warn(`[Gemini API Error for concept ${conceptId}]:`, geminiErr.message);

        // If rate limit (429) or high demand (503), fall back smoothly to pre-verified benchmark
        const isQuotaOrServerIssue =
          geminiErr.message?.includes('429') ||
          geminiErr.message?.includes('503') ||
          geminiErr.message?.includes('quota') ||
          geminiErr.message?.includes('high demand');

        if (isQuotaOrServerIssue) {
          const fallback = (verifiedResults as DiagramResult[]).find((r) => r.conceptId === concept.id);
          if (fallback) {
            return NextResponse.json({
              success: true,
              data: {
                ...fallback,
                generatedAt: new Date().toISOString(),
              },
              notice:
                'Google AI Studio Free Tier rate/daily quota reached (429/503). Loaded calibrated GCSE diagram with all 5 checks passed.',
            });
          }
        }

        // Return clear error if non-recoverable
        return NextResponse.json(
          {
            error: geminiErr.message || 'Error communicating with Google Gemini API.',
          },
          { status: 500 }
        );
      }
    }

    // If no API key configured, serve benchmark
    const fallback = (verifiedResults as DiagramResult[]).find((r) => r.conceptId === concept.id);
    return NextResponse.json({
      success: true,
      data: fallback,
      notice: 'GEMINI_API_KEY not configured. Serving pre-validated diagram from results.json.',
    });
  } catch (err: any) {
    console.error('[API /api/generate fatal error]:', err);
    return NextResponse.json(
      {
        error: err.message || 'An unexpected error occurred while generating the diagram.',
      },
      { status: 500 }
    );
  }
}
