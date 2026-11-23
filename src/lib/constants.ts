import { ConceptDefinition } from '@/types/diagram';

/**
 * The 5 GCSE Science and Maths concepts specified in the Udhi assignment.
 */
export const GCSE_CONCEPTS: ConceptDefinition[] = [
  {
    id: 1,
    name: "Pythagoras' theorem",
    subject: 'Maths',
    promptText:
      'In a right-angled triangle, the longest side is called the hypotenuse. The square of the hypotenuse is equal to the sum of the squares of the other two sides: a2 + b2 = c2.',
  },
  {
    id: 2,
    name: 'Parts of a circle',
    subject: 'Maths',
    promptText:
      'A circle has a centre. The radius is the distance from the centre to the edge. The diameter goes across the circle through the centre and is twice the radius. The circumference is the distance around the circle.',
  },
  {
    id: 3,
    name: 'Series circuit',
    subject: 'Physics',
    promptText:
      'In a series circuit there is only one loop. The current is the same everywhere in the loop. The voltage of the cell is shared between the components.',
  },
  {
    id: 4,
    name: 'Photosynthesis',
    subject: 'Biology',
    promptText:
      'Plants take in carbon dioxide and water. They use light energy, absorbed by chlorophyll, to make glucose and oxygen.',
  },
  {
    id: 5,
    name: 'States of matter',
    subject: 'Chemistry',
    promptText:
      'In a solid the particles are close together and vibrate in place. In a liquid they are close but move past each other. In a gas they are far apart and move fast.',
  },
];

/**
 * Recommended Gemini models for free tier and production.
 * Gemini 2.5 Flash / Gemini 2.0 Flash / Gemini 1.5 Flash
 */
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash'];

/**
 * Pricing rates per 1M tokens (Standard Gemini Flash reference rates)
 * Input: $0.075 per 1,000,000 tokens
 * Output: $0.30 per 1,000,000 tokens
 */
export const PRICING_PER_1M = {
  inputUsd: 0.075,
  outputUsd: 0.30,
};
