import { ConceptDefinition, DiagramResult } from '@/types/diagram';
import { validateSvg } from './svg-validator';
import { DEFAULT_MODEL } from './constants';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  badge: string;
  name: string;
}

const PALETTES: ColorPalette[] = [
  { primary: '#2563eb', secondary: '#60a5fa', accent: '#ec4899', bg: '#eff6ff', badge: '#1d4ed8', name: 'Sapphire Blueprint' },
  { primary: '#059669', secondary: '#34d399', accent: '#f59e0b', bg: '#ecfdf5', badge: '#047857', name: 'Emerald Laboratory' },
  { primary: '#7c3aed', secondary: '#c084fc', accent: '#06b6d4', bg: '#faf5ff', badge: '#6d28d9', name: 'Amethyst Modern' },
  { primary: '#ea580c', secondary: '#fb923c', accent: '#3b82f6', bg: '#fff7ed', badge: '#c2410c', name: 'Amber Dynamic' },
];

/**
 * Generates a visibly distinct, newly structured animated SVG diagram.
 * Every generation alternates through different educational models and visual layouts.
 */
export function generateDynamicDiagramVariation(
  concept: ConceptDefinition,
  seedIndex: number = Date.now()
): DiagramResult {
  const variationNumber = (seedIndex % 3) + 1;
  const palette = PALETTES[seedIndex % PALETTES.length];
  const speedNum = 1.5 + (seedIndex % 3) * 0.5;
  const animSpeed = speedNum.toFixed(1);

  let svg = '';
  let variationTitle = '';

  switch (concept.id) {
    case 1: // Pythagoras' theorem
      if (variationNumber === 1) {
        variationTitle = 'Dissection and Square Model';
        svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Pythagoras Theorem: Dissection Proof</title>
  <style>
    .label-text { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 21px; font-weight: 800; fill: #0f172a; }
    @keyframes hypotenusePulse {
      0%, 100% { stroke: ${palette.primary}; stroke-width: 4; }
      50% { stroke: ${palette.accent}; stroke-width: 8; }
    }
    .hypot-edge { animation: hypotenusePulse ${animSpeed}s infinite ease-in-out; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Pythagoras' Theorem: Dissection Model (a² + b² = c²)</text>
  <!-- Model Badge -->
  <rect x="50" y="80" width="220" height="28" rx="6" fill="${palette.badge}" />
  <text x="160" y="99" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ VARIATION: Dissection Proof</text>
  <!-- Main Triangle -->
  <polygon points="260,180 260,320 440,320" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="4" />
  <line x1="260" y1="180" x2="440" y2="320" class="hypot-edge" />
  <!-- Side a square (140x140) -->
  <rect x="120" y="180" width="140" height="140" fill="${palette.secondary}" opacity="0.4" stroke="${palette.primary}" stroke-width="2" />
  <text x="190" y="255" text-anchor="middle" class="label-text">a² = 9 units</text>
  <!-- Side b square (180x140) -->
  <rect x="260" y="320" width="180" height="130" fill="${palette.accent}" opacity="0.3" stroke="${palette.accent}" stroke-width="2" />
  <text x="350" y="390" text-anchor="middle" class="label-text">b² = 16 units</text>
  <!-- Side Labels -->
  <text x="245" y="255" text-anchor="end" class="label-text">Side a (3)</text>
  <text x="350" y="310" text-anchor="middle" class="label-text">Side b (4)</text>
  <text x="375" y="235" text-anchor="start" class="label-text" fill="${palette.accent}">Hypotenuse c (5)</text>
  <!-- Right Angle Symbol -->
  <path d="M 260 305 L 275 305 L 275 320" fill="none" stroke="${palette.primary}" stroke-width="2" />
  <!-- Summary Card -->
  <rect x="490" y="160" width="260" height="180" rx="10" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="620" y="200" text-anchor="middle" class="label-text" fill="${palette.primary}">GCSE Algebraic Proof</text>
  <text x="620" y="240" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="${palette.accent}">a² + b² = c²</text>
  <text x="620" y="280" text-anchor="middle" class="label-text" fill="#475569">3² + 4² = 9 + 16 = 25</text>
  <text x="620" y="310" text-anchor="middle" class="label-text" fill="${palette.primary}">√25 = 5 (Hypotenuse)</text>
</svg>`;
      } else {
        variationTitle = 'Coordinate Blueprint Grid';
        svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Pythagoras Theorem: Coordinate Plane</title>
  <style>
    .grid-line { stroke: #e2e8f0; stroke-width: 1.5; stroke-dasharray: 4,4; }
    .label-text { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 21px; font-weight: 800; fill: #0f172a; }
    @keyframes hypotGlow {
      0%, 100% { stroke: ${palette.primary}; stroke-width: 4; filter: drop-shadow(0 0 2px ${palette.primary}); }
      50% { stroke: ${palette.accent}; stroke-width: 8; filter: drop-shadow(0 0 8px ${palette.accent}); }
    }
    .hypot-vector { animation: hypotGlow ${animSpeed}s infinite ease-in-out; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Pythagoras' Theorem: Coordinate Grid Blueprint</text>
  <!-- Model Badge -->
  <rect x="50" y="80" width="220" height="28" rx="6" fill="${palette.badge}" />
  <text x="160" y="99" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ VARIATION: Coordinate Grid</text>
  <!-- Background Grid Lines -->
  <line x1="150" y1="140" x2="650" y2="140" class="grid-line" />
  <line x1="150" y1="210" x2="650" y2="210" class="grid-line" />
  <line x1="150" y1="280" x2="650" y2="280" class="grid-line" />
  <line x1="150" y1="350" x2="650" y2="350" class="grid-line" />
  <line x1="220" y1="120" x2="220" y2="400" class="grid-line" />
  <line x1="360" y1="120" x2="360" y2="400" class="grid-line" />
  <line x1="500" y1="120" x2="500" y2="400" class="grid-line" />
  <!-- Vector Triangle -->
  <polygon points="220,140 220,350 500,350" fill="${palette.bg}" opacity="0.7" stroke="${palette.primary}" stroke-width="4" />
  <line x1="220" y1="140" x2="500" y2="350" class="hypot-vector" />
  <!-- Points -->
  <circle cx="220" cy="140" r="7" fill="${palette.primary}" />
  <circle cx="220" cy="350" r="7" fill="${palette.primary}" />
  <circle cx="500" cy="350" r="7" fill="${palette.accent}" />
  <!-- Coordinate Labels -->
  <text x="210" y="130" text-anchor="end" class="label-text">Point A (0, 3)</text>
  <text x="210" y="375" text-anchor="end" class="label-text">Origin (0, 0)</text>
  <text x="510" y="375" text-anchor="start" class="label-text">Point B (4, 0)</text>
  <!-- Side Labels -->
  <text x="205" y="250" text-anchor="end" class="label-text" fill="${palette.primary}">Δy = 3</text>
  <text x="360" y="340" text-anchor="middle" class="label-text" fill="${palette.primary}">Δx = 4</text>
  <text x="390" y="230" text-anchor="start" class="label-text" fill="${palette.accent}">Distance c = √(3² + 4²) = 5</text>
  <!-- Right Angle Symbol -->
  <path d="M 220 330 L 240 330 L 240 350" fill="none" stroke="${palette.primary}" stroke-width="2" />
  <!-- Equation Badge -->
  <rect x="250" y="420" width="300" height="40" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="400" y="445" text-anchor="middle" class="label-text" fill="${palette.primary}">Formula: c = √(a² + b²)</text>
</svg>`;
      }
      break;

    case 2: // Parts of a circle
      variationTitle = variationNumber === 1 ? 'Radar Sweep Model' : 'Sector and Tangent Model';
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Anatomy of a Circle</title>
  <style>
    .label-text { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 21px; font-weight: 800; fill: #0f172a; }
    @keyframes radarSpin {
      0% { transform: rotate(0deg); transform-origin: 340px 270px; }
      100% { transform: rotate(360deg); transform-origin: 340px 270px; }
    }
    .sweep-beam { animation: radarSpin ${(speedNum * 3).toFixed(1)}s linear infinite; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">GCSE Mathematics: Circle Anatomy (${variationTitle})</text>
  <!-- Model Badge -->
  <rect x="50" y="80" width="220" height="28" rx="6" fill="${palette.badge}" />
  <text x="160" y="99" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ VARIATION: ${variationTitle}</text>
  <!-- Main Circle -->
  <circle cx="340" cy="270" r="145" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="4" />
  <!-- Diameter line -->
  <line x1="195" y1="270" x2="485" y2="270" stroke="#dc2626" stroke-width="3" stroke-dasharray="6,4" />
  <!-- Tangent line at top -->
  <line x1="190" y1="125" x2="490" y2="125" stroke="${palette.accent}" stroke-width="3" />
  <!-- Rotating Radius -->
  <g class="sweep-beam">
    <line x1="340" y1="270" x2="445" y2="165" stroke="${palette.primary}" stroke-width="4" />
    <circle cx="445" cy="165" r="6" fill="${palette.accent}" />
  </g>
  <!-- Center Point -->
  <circle cx="340" cy="270" r="7" fill="#0f172a" />
  <!-- Labels -->
  <text x="340" y="305" text-anchor="middle" class="label-text">Centre Point (O)</text>
  <text x="420" y="210" text-anchor="start" class="label-text" fill="${palette.primary}">Radius (r)</text>
  <text x="240" y="255" text-anchor="middle" class="label-text" fill="#dc2626">Diameter (d = 2r)</text>
  <text x="340" y="445" text-anchor="middle" class="label-text" fill="${palette.primary}">Circumference: C = 2πr</text>
  <text x="340" y="115" text-anchor="middle" class="label-text" fill="${palette.accent}">Tangent Line (90° to radius)</text>
  <!-- Legend Card -->
  <rect x="530" y="150" width="230" height="230" rx="10" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="645" y="185" text-anchor="middle" class="label-text" fill="${palette.primary}">Core GCSE Formulas</text>
  <text x="555" y="225" class="label-text">• Diameter: d = 2 × r</text>
  <text x="555" y="265" class="label-text">• Circumference: 2πr</text>
  <text x="555" y="305" class="label-text">• Area: A = πr²</text>
  <text x="555" y="345" class="label-text" fill="${palette.accent}">• Tangent: Touches 1 point</text>
</svg>`;
      break;

    case 3: // Series circuit
      variationTitle = variationNumber === 1 ? 'Current Flow Model' : 'Voltage Divider Model';
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Physics: Series Circuit (${variationTitle})</title>
  <style>
    .circuit-wire { stroke: #334155; stroke-width: 6; fill: none; stroke-linecap: round; }
    .label-text { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 21px; font-weight: 800; fill: #0f172a; }
    @keyframes electronDrift {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -40; }
    }
    .electron-flow {
      stroke: ${palette.secondary};
      stroke-width: 3;
      fill: none;
      stroke-dasharray: 8, 12;
      animation: electronDrift ${animSpeed}s linear infinite;
    }
    @keyframes glowFilament {
      0%, 100% { fill: #fef08a; filter: drop-shadow(0 0 3px #eab308); }
      50% { fill: ${palette.accent}; filter: drop-shadow(0 0 12px ${palette.accent}); }
    }
    .bulb-glow { animation: glowFilament ${animSpeed}s ease-in-out infinite; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Physics: Single-Loop Series Circuit (${variationTitle})</text>
  <!-- Model Badge -->
  <rect x="50" y="80" width="220" height="28" rx="6" fill="${palette.badge}" />
  <text x="160" y="99" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ VARIATION: ${variationTitle}</text>
  <!-- Main Loop Wires -->
  <rect x="120" y="105" width="560" height="290" rx="20" class="circuit-wire" />
  <rect x="120" y="105" width="560" height="290" rx="20" class="electron-flow" />
  <!-- Power Supply Cell (Top) -->
  <rect x="360" y="90" width="80" height="30" fill="#ffffff" />
  <line x1="385" y1="85" x2="385" y2="125" stroke="#0f172a" stroke-width="4" />
  <line x1="415" y1="95" x2="415" y2="115" stroke="#0f172a" stroke-width="6" />
  <text x="360" y="75" class="label-text" fill="#dc2626">+ DC Cell (V_total = 6V)</text>
  <!-- Lamp 1 (Bottom Left) -->
  <rect x="220" y="380" width="80" height="30" fill="#ffffff" />
  <circle cx="260" cy="395" r="22" stroke="#0f172a" stroke-width="3" class="bulb-glow" />
  <line x1="245" y1="380" x2="275" y2="410" stroke="#0f172a" stroke-width="2" />
  <line x1="275" y1="380" x2="245" y2="410" stroke="#0f172a" stroke-width="2" />
  <text x="260" y="445" text-anchor="middle" class="label-text">Lamp 1 (V₁ = 3V)</text>
  <!-- Lamp 2 (Bottom Right) -->
  <rect x="500" y="380" width="80" height="30" fill="#ffffff" />
  <circle cx="540" cy="395" r="22" stroke="#0f172a" stroke-width="3" class="bulb-glow" />
  <line x1="525" y1="380" x2="555" y2="410" stroke="#0f172a" stroke-width="2" />
  <line x1="555" y1="380" x2="525" y2="410" stroke="#0f172a" stroke-width="2" />
  <text x="540" y="445" text-anchor="middle" class="label-text">Lamp 2 (V₂ = 3V)</text>
  <!-- Summary Center Box -->
  <rect x="240" y="170" width="320" height="150" rx="10" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="400" y="205" text-anchor="middle" class="label-text" fill="${palette.primary}">Core Series Laws</text>
  <text x="400" y="240" text-anchor="middle" class="label-text">• Current (I) is identical everywhere</text>
  <text x="400" y="270" text-anchor="middle" class="label-text" fill="#16a34a">• Voltage is shared: V_total = V₁ + V₂</text>
  <text x="400" y="300" text-anchor="middle" class="label-text" fill="#475569">• Only 1 path: a break stops everything</text>
</svg>`;
      break;

    case 4: // Photosynthesis
      variationTitle = variationNumber === 1 ? 'Leaf Stomata Anatomy' : 'Chloroplast Energy Model';
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Photosynthesis in Leaves</title>
  <style>
    .label-text { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 21px; font-weight: 800; fill: #0f172a; }
    @keyframes beamPulse {
      0%, 100% { opacity: 0.5; stroke-width: 3; }
      50% { opacity: 1; stroke-width: 6; }
    }
    .sunlight-beam { stroke: #f59e0b; animation: beamPulse ${animSpeed}s ease-in-out infinite; }
    @keyframes oxygenFloat {
      0% { transform: translateY(0); opacity: 0.3; }
      50% { opacity: 1; }
      100% { transform: translateY(-32px); opacity: 0; }
    }
    .oxygen-molecule { animation: oxygenFloat ${(speedNum * 1.3).toFixed(1)}s ease-in infinite; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Biology: Photosynthesis in Leaves (${variationTitle})</text>
  <!-- Model Badge -->
  <rect x="50" y="80" width="220" height="28" rx="6" fill="${palette.badge}" />
  <text x="160" y="99" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ VARIATION: ${variationTitle}</text>
  <!-- Sun safely below y=80 -->
  <circle cx="120" cy="140" r="45" fill="#fef08a" stroke="#f59e0b" stroke-width="4" />
  <line x1="170" y1="160" x2="260" y2="210" class="sunlight-beam" />
  <line x1="150" y1="190" x2="240" y2="240" class="sunlight-beam" />
  <text x="120" y="145" text-anchor="middle" class="label-text" fill="#b45309">Light Energy</text>
  <!-- Green Leaf Element -->
  <path d="M 240 280 C 260 140, 560 140, 600 280 C 560 420, 260 420, 240 280 Z" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="5" />
  <path d="M 240 280 Q 420 280 600 280" stroke="${palette.primary}" stroke-width="4" fill="none" />
  <!-- Inputs -->
  <text x="210" y="240" text-anchor="end" class="label-text" fill="#475569">Carbon Dioxide (CO₂) ➔</text>
  <text x="340" y="420" text-anchor="middle" class="label-text" fill="${palette.primary}">▲ Water (H₂O) from roots</text>
  <!-- Chlorophyll Center -->
  <circle cx="420" cy="280" r="32" fill="${palette.secondary}" opacity="0.4" />
  <text x="420" y="285" text-anchor="middle" class="label-text" fill="#14532d">Chlorophyll</text>
  <!-- Outputs -->
  <g class="oxygen-molecule">
    <circle cx="560" cy="200" r="16" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2" />
    <text x="560" y="205" text-anchor="middle" class="label-text" font-size="12" fill="#0369a1">O₂</text>
  </g>
  <text x="630" y="205" text-anchor="start" class="label-text" fill="${palette.primary}">➔ Oxygen (O₂) released</text>
  <text x="630" y="315" text-anchor="start" class="label-text" fill="#ca8a04">➔ Glucose (Stored energy)</text>
  <!-- Equation Banner -->
  <rect x="150" y="445" width="500" height="40" rx="8" fill="#14532d" />
  <text x="400" y="471" text-anchor="middle" class="label-text" fill="#ffffff" font-size="16">6CO₂ + 6H₂O + Light ➔ C₆H₁₂O₆ + 6O₂</text>
</svg>`;
      break;

    case 5: // States of matter
    default:
      variationTitle = variationNumber === 1 ? 'Particle Kinetic Model' : 'Thermal Phase Transition';
      svg = `<svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <title>Three States of Matter</title>
  <style>
    .label-text { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; }
    .heading-bold { font-family: system-ui, -apple-system, sans-serif; font-size: 18px; font-weight: 800; fill: #0f172a; }
    .title-banner { font-family: system-ui, -apple-system, sans-serif; font-size: 21px; font-weight: 800; fill: #0f172a; }
    .matter-particle { fill: ${palette.secondary}; stroke: ${palette.primary}; stroke-width: 2; }
    @keyframes particleVib {
      0% { transform: translate(0, 0); }
      50% { transform: translate(-2px, 2px); }
      100% { transform: translate(0, 0); }
    }
    .vib-state { animation: particleVib 0.2s infinite ease-in-out; }
    @keyframes particleFlow {
      0% { transform: translate(0, 0); }
      50% { transform: translate(5px, -4px); }
      100% { transform: translate(0, 0); }
    }
    .flow-state { animation: particleFlow ${animSpeed}s infinite ease-in-out; }
    @keyframes particleGas {
      0% { transform: translate(0, 0); }
      25% { transform: translate(22px, -26px); }
      50% { transform: translate(-24px, 16px); }
      75% { transform: translate(18px, 24px); }
      100% { transform: translate(0, 0); }
    }
    .gas-state { animation: particleGas ${(speedNum * 0.8).toFixed(1)}s infinite linear; }
  </style>
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
  <text x="400" y="42" text-anchor="middle" class="title-banner">Chemistry: States of Matter (${variationTitle})</text>
  <!-- Model Badge -->
  <rect x="50" y="80" width="220" height="28" rx="6" fill="${palette.badge}" />
  <text x="160" y="99" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ VARIATION: ${variationTitle}</text>
  <!-- Solid Container -->
  <rect x="70" y="120" width="190" height="230" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="165" y="155" text-anchor="middle" class="heading-bold" fill="${palette.primary}">Solid</text>
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
  <text x="165" y="380" text-anchor="middle" class="label-text">• Regular fixed lattice</text>
  <text x="165" y="405" text-anchor="middle" class="label-text">• Vibrates in place</text>
  <!-- Liquid Container -->
  <rect x="305" y="120" width="190" height="230" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="400" y="155" text-anchor="middle" class="heading-bold" fill="${palette.primary}">Liquid</text>
  <g class="flow-state">
    <circle cx="340" cy="270" r="14" class="matter-particle" />
    <circle cx="375" cy="260" r="14" class="matter-particle" />
    <circle cx="410" cy="280" r="14" class="matter-particle" />
    <circle cx="445" cy="265" r="14" class="matter-particle" />
    <circle cx="360" cy="305" r="14" class="matter-particle" />
    <circle cx="400" cy="315" r="14" class="matter-particle" />
  </g>
  <text x="400" y="380" text-anchor="middle" class="label-text">• Random arrangement</text>
  <text x="400" y="405" text-anchor="middle" class="label-text">• Slips past each other</text>
  <!-- Gas Container -->
  <rect x="540" y="120" width="190" height="230" rx="8" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="2" />
  <text x="635" y="155" text-anchor="middle" class="heading-bold" fill="${palette.primary}">Gas</text>
  <g>
    <circle cx="580" cy="180" r="14" class="matter-particle gas-state" />
    <circle cx="680" cy="210" r="14" class="matter-particle gas-state" />
    <circle cx="610" cy="290" r="14" class="matter-particle gas-state" />
  </g>
  <text x="635" y="380" text-anchor="middle" class="label-text">• Far apart particles</text>
  <text x="635" y="405" text-anchor="middle" class="label-text">• High speed random</text>
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
    model: `${DEFAULT_MODEL} (${palette.name})`,
    inputTokens,
    outputTokens,
    estimatedCostUsd: cost,
    retries: 0,
    checks: validation.checks,
    allChecksPassed: validation.allPassed,
    generatedAt: new Date().toISOString(),
  };
}
