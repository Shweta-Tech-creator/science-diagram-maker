import { NextRequest, NextResponse } from 'next/server';
import { generateDiagramForConcept } from '@/lib/gemini';
import { GCSE_CONCEPTS, DEFAULT_MODEL } from '@/lib/constants';

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
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Server GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY in .env.local or your deployment environment variables.',
        },
        { status: 500 }
      );
    }

    const result = await generateDiagramForConcept(concept, apiKey, model);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[API /api/generate error]:', err);
    return NextResponse.json(
      {
        error: err.message || 'An unexpected error occurred while generating the diagram.',
      },
      { status: 500 }
    );
  }
}
