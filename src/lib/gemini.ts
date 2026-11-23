import { ConceptDefinition, DiagramResult } from '@/types/diagram';
import { extractSvgString, validateSvg } from './svg-validator';
import { DEFAULT_MODEL, PRICING_PER_1M } from './constants';

interface GeminiApiRawResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Delays execution for a specified duration in milliseconds.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculates estimated USD cost based on token counts and model pricing.
 */
export function calculateCostUsd(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * PRICING_PER_1M.inputUsd;
  const outputCost = (outputTokens / 1_000_000) * PRICING_PER_1M.outputUsd;
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Calls Google Gemini REST API with automated backoff for 429 and 503 errors (up to 3 retries).
 */
export async function callGeminiApiWithBackoff(
  prompt: string,
  apiKey: string,
  model: string = DEFAULT_MODEL,
  maxApiRetries: number = 3
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please set it in .env.local or environment variables.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxApiRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3, // Lower temperature keeps SVG syntax consistent and predictable
            topP: 0.9,
          },
        }),
      });

      // Handle rate limit (429) or service unavailable (503)
      if (response.status === 429 || response.status === 503) {
        const errorText = await response.text();
        const backoffMs = Math.pow(2, attempt) * 1500; // 3s, 6s, 12s
        console.warn(`[Gemini API] Received HTTP ${response.status} on attempt ${attempt}. Waiting ${backoffMs}ms before retry...`);

        if (attempt < maxApiRetries) {
          await delay(backoffMs);
          continue;
        } else {
          throw new Error(`Gemini API failed with status ${response.status} after ${maxApiRetries} attempts: ${errorText}`);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (HTTP ${response.status}): ${errorText}`);
      }

      const data: GeminiApiRawResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API Error: [${data.error.code}] ${data.error.message}`);
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const inputTokens = data.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
      const outputTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(generatedText.length / 4);

      return { text: generatedText, inputTokens, outputTokens };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxApiRetries && (err.message?.includes('429') || err.message?.includes('503'))) {
        const backoffMs = Math.pow(2, attempt) * 1500;
        await delay(backoffMs);
        continue;
      }
      if (attempt >= maxApiRetries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Failed to communicate with Gemini API');
}

/**
 * Builds the educational SVG prompt tailored for GCSE students.
 */
function buildSystemPrompt(concept: ConceptDefinition): string {
  return `You are an expert UK GCSE Science and Maths educational diagram illustrator.
Create a complete, beautiful, clear, animated SVG diagram for:

CONCEPT: ${concept.name} (${concept.subject})
DESCRIPTION: "${concept.promptText}"

CRITICAL REQUIREMENTS:
1. Return ONLY the raw SVG code inside an \`\`\`xml ... \`\`\` block or raw <svg>...</svg>. Do NOT include any conversational preamble or outro.
2. Root element: <svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
3. Strict bounds: Every visual element, label, and circle MUST fit comfortably within viewBox (0 to 800 horizontally, 0 to 500 vertically). Leave at least 30px padding.
4. Title & Labels: Must include:
   - A descriptive <title>${concept.name}</title>
   - At least 3 clear <text> labels clearly explaining core terms/variables for GCSE students.
5. Animation: Add meaningful, loopable animation using either CSS keyframes (<style> with @keyframes) or SMIL (<animate>, <animateTransform>). For example, flowing current in a circuit, vibrating particles, or pulsing sunlight.
6. Vector Elements: Use clean geometric vector shapes (<path>, <circle>, <rect>, <polygon>, etc.) with a modern, high-contrast, professional palette.
7. Security: Do NOT include any <script> tags or external links.`;
}

/**
 * Executes Part A for a single concept:
 * 1. Calls Gemini with prompt.
 * 2. Runs the 5 automated checks.
 * 3. If any check fails, retries ONCE with specific failure feedback.
 * 4. Logs all metrics (tokens, cost, retries, checks passed/failed).
 */
export async function generateDiagramForConcept(
  concept: ConceptDefinition,
  apiKey: string,
  model: string = DEFAULT_MODEL
): Promise<DiagramResult> {
  const initialPrompt = buildSystemPrompt(concept);

  let retries = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let initialValidationFailed = false;
  let retryReason = '';

  // Initial Attempt
  console.log(`[Generate] Requesting initial diagram for "${concept.name}"...`);
  const initialRes = await callGeminiApiWithBackoff(initialPrompt, apiKey, model);
  totalInputTokens += initialRes.inputTokens;
  totalOutputTokens += initialRes.outputTokens;

  let currentSvg = extractSvgString(initialRes.text);
  let validation = validateSvg(currentSvg);

  // If validation fails, retry ONCE with feedback as required by assignment specification
  if (!validation.allPassed) {
    retries = 1;
    initialValidationFailed = true;
    retryReason = validation.failureReasons.join('; ');
    console.warn(`[Generate] "${concept.name}" failed initial checks (${retryReason}). Retrying once with corrective prompt...`);

    const correctivePrompt = `${initialPrompt}

URGENT CORRECTION REQUIRED:
Your previous SVG output failed the automated quality verification for the following reasons:
- ${validation.failureReasons.join('\n- ')}

Please fix these exact issues now:
- Ensure all coordinates stay within viewBox="0 0 800 500".
- Ensure there is a <title> and at least 3 <text> labels.
- Ensure loopable animation (<animate> or @keyframes) is present.
- Return the full, corrected, valid SVG.`;

    const retryRes = await callGeminiApiWithBackoff(correctivePrompt, apiKey, model);
    totalInputTokens += retryRes.inputTokens;
    totalOutputTokens += retryRes.outputTokens;

    currentSvg = extractSvgString(retryRes.text);
    validation = validateSvg(currentSvg);
  }

  const estimatedCostUsd = calculateCostUsd(totalInputTokens, totalOutputTokens);

  return {
    conceptId: concept.id,
    conceptName: concept.name,
    subject: concept.subject,
    promptText: concept.promptText,
    svg: currentSvg,
    model,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    estimatedCostUsd,
    retries,
    checks: validation.checks,
    allChecksPassed: validation.allPassed,
    generatedAt: new Date().toISOString(),
    initialValidationFailed,
    retryReason: initialValidationFailed ? retryReason : undefined,
  };
}
