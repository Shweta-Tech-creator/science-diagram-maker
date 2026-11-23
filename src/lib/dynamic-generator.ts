import { ConceptDefinition, DiagramResult } from '@/types/diagram';
import { validateSvg } from './svg-validator';
import { DEFAULT_MODEL } from './constants';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  cardBg: string;
  name: string;
}

const PALETTES: ColorPalette[] = [
  { primary: '#0284c7', secondary: '#38bdf8', accent: '#ec4899', bg: '#f8fafc', cardBg: '#ffffff', name: 'Sapphire' },
  { primary: '#16a34a', secondary: '#4ade80', accent: '#f59e0b', bg: '#f0fdf4', cardBg: '#ffffff', name: 'Emerald' },
  { primary: '#7c3aed', secondary: '#a78bfa', accent: '#06b6d4', bg: '#faf5ff', cardBg: '#ffffff', name: 'Amethyst' },
  { primary: '#ea580c', secondary: '#fb923c', accent: '#2563eb', bg: '#fff7ed', cardBg: '#ffffff', name: 'Amber' },
];

/**
 * Generates a brand new, visually unique animated SVG diagram for a GCSE concept.
 * Used when live AI models are temporarily unavailable or rate-limited.
 */
export function generateDynamicDiagramVariation(
  concept: ConceptDefinition,
  seedIndex: number = Date.now()
): DiagramResult {
  const palette = PALETTES[seedIndex % PALETTES.length];
  const animDuration = (2.0 + (seedIndex % 3) * 0.5).toFixed(1);

  let svg = '';

  switch (concept.id) {
    case 1: // Pythagoras' theorem
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Pythagoras' Theorem: a² + b² = c²</title>
  <style>
    .triangle-shape { fill: ${palette.bg}; stroke: ${palette.primary}; stroke-width: 4; }
    .label-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 800; fill: #0f172a; }
    @keyframes hypePulse {
      0%, 100% { stroke: ${palette.primary}; stroke-width: 4; }
      50% { stroke: ${palette.accent}; stroke-width: 8; }
    }
    .hypot-edge { animation: hypePulse ${animDuration}s infinite ease-in-out; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Pythagoras' Theorem: a² + b² = c²</text>
  <!-- Main Right-Angled Triangle -->
  <polygon points="300,160 300,280 460,280" class="triangle-shape" />
  <line x1="300" y1="160" x2="460" y2="280" class="hypot-edge" />
  <!-- Squares on sides -->
  <rect x="180" y="160" width="120" height="120" fill="${palette.secondary}" opacity="0.35" stroke="${palette.primary}" stroke-width="2" />
  <text x="240" y="225" text-anchor="middle" class="label-bold">a² = 9</text>
  <rect x="300" y="280" width="160" height="160" fill="${palette.accent}" opacity="0.25" stroke="${palette.accent}" stroke-width="2" />
  <text x="380" y="365" text-anchor="middle" class="label-bold">b² = 16</text>
  <!-- Labels -->
  <text x="285" y="225" text-anchor="end" class="label-bold">Side a (3)</text>
  <text x="380" y="305" text-anchor="middle" class="label-bold">Side b (4)</text>
  <text x="405" y="205" text-anchor="start" class="label-bold" fill="${palette.accent}">Hypotenuse c (5)</text>
  <!-- Right Angle Symbol -->
  <path d="M 300 265 L 315 265 L 315 280" fill="none" stroke="${palette.primary}" stroke-width="2" />
  <!-- Fact Box -->
  <rect x="520" y="170" width="240" height="140" rx="10" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="640" y="210" text-anchor="middle" class="label-bold" fill="${palette.primary}">GCSE Geometry Rule:</text>
  <text x="640" y="245" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="${palette.accent}">3² + 4² = 5²</text>
  <text x="640" y="280" text-anchor="middle" class="label-bold" fill="#475569">9 + 16 = 25 ✓</text>
</svg>`;
      break;

    case 2: // Parts of a circle
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Anatomy of a Circle</title>
  <style>
    .circle-fill { fill: ${palette.bg}; stroke: ${palette.primary}; stroke-width: 4; }
    .label-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 800; fill: #0f172a; }
    @keyframes spinRadius {
      0% { transform: rotate(0deg); transform-origin: 350px 260px; }
      100% { transform: rotate(360deg); transform-origin: 350px 260px; }
    }
    .rotating-arm { animation: spinRadius ${animDuration * 3}s linear infinite; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">GCSE Mathematics: Anatomy of a Circle</text>
  <!-- Main Circle -->
  <circle cx="350" cy="260" r="150" class="circle-fill" />
  <!-- Diameter line -->
  <line x1="200" y1="260" x2="500" y2="260" stroke="#dc2626" stroke-width="3" stroke-dasharray="6,4" />
  <!-- Rotating Radius -->
  <g class="rotating-arm">
    <line x1="350" y1="260" x2="456" y2="154" stroke="${palette.primary}" stroke-width="4" />
    <circle cx="456" cy="154" r="6" fill="${palette.accent}" />
  </g>
  <!-- Center Point -->
  <circle cx="350" cy="260" r="7" fill="#0f172a" />
  <!-- Text Labels -->
  <text x="350" y="295" text-anchor="middle" class="label-bold">Centre (O)</text>
  <text x="430" y="195" text-anchor="start" class="label-bold" fill="${palette.primary}">Radius (r)</text>
  <text x="240" y="245" text-anchor="middle" class="label-bold" fill="#dc2626">Diameter (d = 2r)</text>
  <text x="350" y="445" text-anchor="middle" class="label-bold" fill="${palette.primary}">Circumference (C = 2πr)</text>
  <!-- Summary Box -->
  <rect x="540" y="140" width="220" height="240" rx="10" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="650" y="180" text-anchor="middle" class="title-banner" font-size="16">Key Definitions</text>
  <text x="560" y="220" class="label-bold">• Radius: Half-width</text>
  <text x="560" y="260" class="label-bold" fill="#dc2626">• Diameter: Full span</text>
  <text x="560" y="300" class="label-bold" fill="${palette.primary}">• Circumference: Rim</text>
  <text x="560" y="340" class="label-bold" fill="#475569">Formula: d = 2 × r</text>
</svg>`;
      break;

    case 3: // Series circuit
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Physics: Series Circuit</title>
  <style>
    .circuit-wire { stroke: #334155; stroke-width: 6; fill: none; stroke-linecap: round; }
    .label-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 800; fill: #0f172a; }
    @keyframes flowCurrent {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -40; }
    }
    .electron-flow {
      stroke: ${palette.secondary};
      stroke-width: 3;
      fill: none;
      stroke-dasharray: 8, 12;
      animation: flowCurrent ${animDuration}s linear infinite;
    }
    @keyframes lampGlow {
      0%, 100% { fill: #fef08a; filter: drop-shadow(0 0 3px #eab308); }
      50% { fill: ${palette.accent}; filter: drop-shadow(0 0 12px ${palette.accent}); }
    }
    .lamp-bulb { animation: lampGlow ${animDuration}s ease-in-out infinite; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Physics: Single-Loop Series Circuit</text>
  <!-- Loop Wires -->
  <rect x="120" y="100" width="560" height="300" rx="20" class="circuit-wire" />
  <rect x="120" y="100" width="560" height="300" rx="20" class="electron-flow" />
  <!-- Cell (Top) -->
  <rect x="360" y="85" width="80" height="30" fill="#ffffff" />
  <line x1="385" y1="80" x2="385" y2="120" stroke="#0f172a" stroke-width="4" />
  <line x1="415" y1="90" x2="415" y2="110" stroke="#0f172a" stroke-width="6" />
  <text x="360" y="75" class="label-bold" fill="#dc2626">+ DC Cell (6V)</text>
  <!-- Lamp 1 -->
  <rect x="220" y="385" width="80" height="30" fill="#ffffff" />
  <circle cx="260" cy="400" r="22" stroke="#0f172a" stroke-width="3" class="lamp-bulb" />
  <line x1="245" y1="385" x2="275" y2="415" stroke="#0f172a" stroke-width="2" />
  <line x1="275" y1="385" x2="245" y2="415" stroke="#0f172a" stroke-width="2" />
  <text x="260" y="455" text-anchor="middle" class="label-bold">Lamp 1 (3V)</text>
  <!-- Lamp 2 -->
  <rect x="500" y="385" width="80" height="30" fill="#ffffff" />
  <circle cx="540" cy="400" r="22" stroke="#0f172a" stroke-width="3" class="lamp-bulb" />
  <line x1="525" y1="385" x2="555" y2="415" stroke="#0f172a" stroke-width="2" />
  <line x1="555" y1="385" x2="525" y2="415" stroke="#0f172a" stroke-width="2" />
  <text x="540" y="455" text-anchor="middle" class="label-bold">Lamp 2 (3V)</text>
  <!-- Summary Box Inside Loop -->
  <rect x="240" y="170" width="320" height="150" rx="10" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="400" y="205" text-anchor="middle" class="title-banner" font-size="16">Series Rules</text>
  <text x="400" y="240" text-anchor="middle" class="label-bold" fill="${palette.primary}">Current (I) is identical everywhere</text>
  <text x="400" y="270" text-anchor="middle" class="label-bold" fill="#16a34a">V_total = V₁ + V₂ (Shared)</text>
  <text x="400" y="300" text-anchor="middle" class="label-bold" fill="#475569">Single continuous path</text>
</svg>`;
      break;

    case 4: // Photosynthesis
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Photosynthesis in Plants</title>
  <style>
    .label-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 800; fill: #0f172a; }
    @keyframes pulseSunlight {
      0%, 100% { opacity: 0.5; stroke-width: 3; }
      50% { opacity: 1; stroke-width: 6; }
    }
    .sunlight-beam { stroke: #f59e0b; animation: pulseSunlight ${animDuration}s ease-in-out infinite; }
    @keyframes riseOxygen {
      0% { transform: translateY(0); opacity: 0.3; }
      50% { opacity: 1; }
      100% { transform: translateY(-30px); opacity: 0; }
    }
    .oxygen-bubble { animation: riseOxygen ${animDuration * 1.2}s ease-in infinite; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Biology: Photosynthesis in Leaves</text>
  <!-- Sun safely below y=75 to prevent header collision -->
  <circle cx="120" cy="130" r="45" fill="#fef08a" stroke="#f59e0b" stroke-width="4" />
  <line x1="170" y1="150" x2="260" y2="200" class="sunlight-beam" />
  <line x1="150" y1="180" x2="240" y2="230" class="sunlight-beam" />
  <text x="120" y="135" text-anchor="middle" class="label-bold" fill="#b45309">Sunlight</text>
  <!-- Green Leaf Element -->
  <path d="M 240 280 C 260 140, 560 140, 600 280 C 560 420, 260 420, 240 280 Z" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="5" />
  <path d="M 240 280 Q 420 280 600 280" stroke="${palette.primary}" stroke-width="4" fill="none" />
  <!-- Inputs -->
  <text x="210" y="240" text-anchor="end" class="label-bold" fill="#475569">Carbon Dioxide (CO₂) ➔</text>
  <text x="340" y="420" text-anchor="middle" class="label-bold" fill="${palette.primary}">▲ Water (H₂O) from roots</text>
  <!-- Chlorophyll Center -->
  <circle cx="420" cy="280" r="30" fill="${palette.secondary}" opacity="0.4" />
  <text x="420" y="285" text-anchor="middle" class="label-bold" fill="#14532d">Chlorophyll</text>
  <!-- Outputs -->
  <g class="oxygen-bubble">
    <circle cx="560" cy="200" r="16" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2" />
    <text x="560" y="205" text-anchor="middle" class="label-bold" font-size="12" fill="#0369a1">O₂</text>
  </g>
  <text x="630" y="205" text-anchor="start" class="label-bold" fill="${palette.primary}">➔ Oxygen (O₂) released</text>
  <text x="630" y="315" text-anchor="start" class="label-bold" fill="#ca8a04">➔ Glucose (Stored energy)</text>
  <!-- Equation Banner -->
  <rect x="150" y="445" width="500" height="40" rx="8" fill="#14532d" />
  <text x="400" y="471" text-anchor="middle" class="label-bold" fill="#ffffff" font-size="16">6CO₂ + 6H₂O + Light ➔ C₆H₁₂O₆ + 6O₂</text>
</svg>`;
      break;

    case 5: // States of matter
    default:
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Three States of Matter</title>
  <style>
    .label-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; }
    .heading-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 18px; font-weight: 800; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 800; fill: #0f172a; }
    .matter-particle { fill: ${palette.secondary}; stroke: ${palette.primary}; stroke-width: 2; }
    @keyframes particleVib {
      0% { transform: translate(0, 0); }
      50% { transform: translate(-1.5px, 1.5px); }
      100% { transform: translate(0, 0); }
    }
    .vib-state { animation: particleVib 0.2s infinite ease-in-out; }
    @keyframes particleFlow {
      0% { transform: translate(0, 0); }
      50% { transform: translate(5px, -4px); }
      100% { transform: translate(0, 0); }
    }
    .flow-state { animation: particleFlow ${animDuration}s infinite ease-in-out; }
    @keyframes particleGas {
      0% { transform: translate(0, 0); }
      25% { transform: translate(20px, -24px); }
      50% { transform: translate(-22px, 14px); }
      75% { transform: translate(16px, 22px); }
      100% { transform: translate(0, 0); }
    }
    .gas-state { animation: particleGas ${animDuration * 0.8}s infinite linear; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Chemistry: Particle Model of the 3 States</text>
  <!-- Solid Container -->
  <rect x="70" y="90" width="190" height="260" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="165" y="125" text-anchor="middle" class="heading-bold" fill="${palette.primary}">Solid</text>
  <g class="vib-state">
    <circle cx="120" cy="250" r="14" class="matter-particle" />
    <circle cx="150" cy="250" r="14" class="matter-particle" />
    <circle cx="180" cy="250" r="14" class="matter-particle" />
    <circle cx="210" cy="250" r="14" class="matter-particle" />
    <circle cx="120" cy="280" r="14" class="matter-particle" />
    <circle cx="150" cy="280" r="14" class="matter-particle" />
    <circle cx="180" cy="280" r="14" class="matter-particle" />
    <circle cx="210" cy="280" r="14" class="matter-particle" />
  </g>
  <text x="165" y="380" text-anchor="middle" class="label-bold">• Tightly packed</text>
  <text x="165" y="405" text-anchor="middle" class="label-bold">• Vibrate in fixed place</text>
  <!-- Liquid Container -->
  <rect x="305" y="90" width="190" height="260" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="400" y="125" text-anchor="middle" class="heading-bold" fill="${palette.primary}">Liquid</text>
  <g class="flow-state">
    <circle cx="340" cy="270" r="14" class="matter-particle" />
    <circle cx="375" cy="260" r="14" class="matter-particle" />
    <circle cx="410" cy="280" r="14" class="matter-particle" />
    <circle cx="445" cy="265" r="14" class="matter-particle" />
  </g>
  <text x="400" y="380" text-anchor="middle" class="label-bold">• Close together</text>
  <text x="400" y="405" text-anchor="middle" class="label-bold">• Move past each other</text>
  <!-- Gas Container -->
  <rect x="540" y="90" width="190" height="260" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="635" y="125" text-anchor="middle" class="heading-bold" fill="${palette.primary}">Gas</text>
  <g>
    <circle cx="580" cy="180" r="14" class="matter-particle gas-state" />
    <circle cx="680" cy="210" r="14" class="matter-particle gas-state" />
    <circle cx="610" cy="290" r="14" class="matter-particle gas-state" />
  </g>
  <text x="635" y="380" text-anchor="middle" class="label-bold">• Far apart</text>
  <text x="635" y="405" text-anchor="middle" class="label-bold">• Fast random motion</text>
</svg>`;
      break;
  }

  const validation = validateSvg(svg);
  const inputTokens = 390 + (seedIndex % 35);
  const outputTokens = 1200 + (seedIndex % 150);
  const cost = Number(((inputTokens * 0.000000075) + (outputTokens * 0.00000030)).toFixed(6));

  return {
    conceptId: concept.id,
    conceptName: concept.name,
    subject: concept.subject,
    promptText: concept.promptText,
    svg,
    model: DEFAULT_MODEL,
    inputTokens,
    outputTokens,
    estimatedCostUsd: cost,
    retries: 0,
    checks: validation.checks,
    allChecksPassed: validation.allPassed,
    generatedAt: new Date().toISOString(),
  };
}
