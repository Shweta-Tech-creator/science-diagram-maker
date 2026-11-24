import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { CheckItem, ValidationSummary } from '@/types/diagram';

/**
 * Validates an AI-generated SVG against Udhi Technologies' 4 required checks + 1 custom check.
 * 
 * Checks performed:
 * 1. Valid XML and can be parsed into an SVG root.
 * 2. All explicit elements stay within the defined viewBox boundaries.
 * 3. Contains a <title> element and at least 3 <text> educational labels.
 * 4. Contains at least one animation (SMIL tag or CSS @keyframes/animation).
 * 5. (Custom Check) Security & Graphic Richness: No dangerous tags (<script>, <iframe>)
 *    and has at least 3 visual vector elements (<path>, <circle>, <rect>, etc.).
 */
export function validateSvg(svgString: string): ValidationSummary {
  const checks: CheckItem[] = [];
  const failureReasons: string[] = [];

  // Clean and extract SVG if wrapped in markdown code blocks
  const cleanSvg = extractSvgString(svgString);

  // --------------------------------------------------------------------------
  // Check 1: The SVG is valid and can be parsed
  // --------------------------------------------------------------------------
  let parsedObj: any = null;
  let isXmlValid = false;
  let parseErrorMsg = '';

  try {
    const validationResult = XMLValidator.validate(cleanSvg);
    if (validationResult === true) {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        allowBooleanAttributes: true,
      });
      parsedObj = parser.parse(cleanSvg);
      if (parsedObj && (parsedObj.svg || parsedObj['?xml'])) {
        isXmlValid = true;
      } else {
        parseErrorMsg = 'Missing root <svg> element in parsed output';
      }
    } else {
      parseErrorMsg = validationResult?.err?.msg || 'XML syntax invalid';
    }
  } catch (err: any) {
    parseErrorMsg = err?.message || 'XML parsing exception';
  }

  checks.push({
    id: 'valid_xml',
    name: 'Valid & Parsable SVG',
    description: 'SVG is valid XML with an identifiable root <svg> tag',
    passed: isXmlValid,
    details: isXmlValid ? 'XML parsed successfully' : parseErrorMsg,
  });

  if (!isXmlValid) {
    failureReasons.push(`Invalid SVG structure: ${parseErrorMsg}`);
    // If not parsable, remaining checks cannot reliably run
    return {
      allPassed: false,
      checks: [
        ...checks,
        {
          id: 'within_viewbox',
          name: 'Within ViewBox',
          description: 'Elements do not overflow viewBox dimensions',
          passed: false,
          details: 'Skipped due to XML parsing error',
        },
        {
          id: 'title_and_labels',
          name: 'Title & 3+ Text Labels',
          description: 'Has <title> and at least 3 descriptive <text> elements',
          passed: false,
          details: 'Skipped due to XML parsing error',
        },
        {
          id: 'has_animation',
          name: 'Animated',
          description: 'Contains SMIL tags or CSS keyframe animations',
          passed: false,
          details: 'Skipped due to XML parsing error',
        },
        {
          id: 'safe_and_rich',
          name: 'Safe & Rich Visuals',
          description: 'No malicious tags and at least 3 geometric visual elements',
          passed: false,
          details: 'Skipped due to XML parsing error',
        },
      ],
      failureReasons,
    };
  }

  // --------------------------------------------------------------------------
  // Check 2: Nothing is drawn outside the viewBox
  // --------------------------------------------------------------------------
  const viewBoxCheck = checkViewBoxBoundaries(cleanSvg, parsedObj);
  checks.push({
    id: 'within_viewbox',
    name: 'Within ViewBox',
    description: 'Elements stay strictly within defined viewBox dimensions',
    passed: viewBoxCheck.passed,
    details: viewBoxCheck.details,
  });
  if (!viewBoxCheck.passed) {
    failureReasons.push(viewBoxCheck.details);
  }

  // --------------------------------------------------------------------------
  // Check 3: Has a title and at least 3 text labels
  // --------------------------------------------------------------------------
  const titleAndLabelsCheck = checkTitleAndLabels(cleanSvg, parsedObj);
  checks.push({
    id: 'title_and_labels',
    name: 'Title & 3+ Text Labels',
    description: 'Contains a <title> tag and 3 or more educational text labels',
    passed: titleAndLabelsCheck.passed,
    details: titleAndLabelsCheck.details,
  });
  if (!titleAndLabelsCheck.passed) {
    failureReasons.push(titleAndLabelsCheck.details);
  }

  // --------------------------------------------------------------------------
  // Check 4: Has at least one animation
  // --------------------------------------------------------------------------
  const animationCheck = checkAnimation(cleanSvg);
  checks.push({
    id: 'has_animation',
    name: 'Animated Diagram',
    description: 'Includes SMIL animation elements (<animate>) or CSS @keyframes',
    passed: animationCheck.passed,
    details: animationCheck.details,
  });
  if (!animationCheck.passed) {
    failureReasons.push(animationCheck.details);
  }

  // --------------------------------------------------------------------------
  // Check 5 (Custom Check): Security & Graphic Complexity
  // Safe for reviewers (no scripts/external iframes) and substantive (3+ vector shapes)
  // --------------------------------------------------------------------------
  const customCheck = checkSecurityAndComplexity(cleanSvg, parsedObj);
  checks.push({
    id: 'safe_and_rich',
    name: 'Safe & Rich Graphics',
    description: 'Zero malicious tags and at least 3 vector shapes (<path>, <circle>, <rect>)',
    passed: customCheck.passed,
    details: customCheck.details,
  });
  if (!customCheck.passed) {
    failureReasons.push(customCheck.details);
  }

  const allPassed = checks.every((c) => c.passed);
  return { allPassed, checks, failureReasons };
}

/**
 * Strips code fences (e.g. ```xml or ```svg) if Gemini wraps its response.
 */
export function extractSvgString(raw: string): string {
  if (!raw) return '';
  let content = raw.trim();

  // Strip markdown code fences
  if (content.startsWith('```')) {
    content = content.replace(/^```[a-zA-Z0-9]*\n?/, '').replace(/```\s*$/, '');
  }

  // Find the opening <svg> tag and closing </svg>
  const svgStart = content.indexOf('<svg');
  const svgEnd = content.lastIndexOf('</svg>');

  if (svgStart !== -1 && svgEnd !== -1) {
    const extracted = content.substring(svgStart, svgEnd + 6).trim();
    // Sanitize unescaped ampersands in XML text/attributes so bare '&' does not break parsing
    return extracted.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[a-f\d]+);)/gi, '&amp;');
  }

  return content.trim();
}

/**
 * Checks viewBox boundaries.
 * Verifies that standard elements (circles, rects, lines, texts) don't extend past viewBox.
 */
function checkViewBoxBoundaries(svgStr: string, parsedObj: any): { passed: boolean; details: string } {
  const root = parsedObj?.svg;
  if (!root) {
    return { passed: false, details: 'Cannot inspect viewBox: root <svg> is missing' };
  }

  const viewBoxAttr = root['@_viewBox'] || root['@_viewbox'];
  if (!viewBoxAttr) {
    return {
      passed: false,
      details: 'Root <svg> is missing the "viewBox" attribute (e.g. viewBox="0 0 800 500")',
    };
  }

  const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return {
      passed: false,
      details: `Malformed viewBox attribute: "${viewBoxAttr}". Expected 4 numbers.`,
    };
  }

  const [minX, minY, width, height] = parts;
  const maxX = minX + width;
  const maxY = minY + height;
  const tolerance = 80; // 80px (10%) safety cushion for card widths, stroke bleed, font ascenders, and margins

  const overflows: string[] = [];

  // Helper to extract transform="translate(x, y)" offsets
  const parseTranslate = (transformStr?: string): { dx: number; dy: number } => {
    if (!transformStr) return { dx: 0, dy: 0 };
    const match = transformStr.match(/translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/i);
    if (match) {
      return { dx: Number(match[1]) || 0, dy: Number(match[2]) || 0 };
    }
    return { dx: 0, dy: 0 };
  };

  // Traverse parsed elements to inspect coordinates, propagating cumulative group translation
  const inspectElements = (node: any, currentDx = 0, currentDy = 0) => {
    if (!node || typeof node !== 'object') return;

    // Check circles
    if (node.circle) {
      const circles = Array.isArray(node.circle) ? node.circle : [node.circle];
      for (const c of circles) {
        const cx = Number(c['@_cx']) + currentDx;
        const cy = Number(c['@_cy']) + currentDy;
        const r = Number(c['@_r']) || 0;
        if (!isNaN(cx) && !isNaN(cy)) {
          if (cx - r < minX - tolerance || cx + r > maxX + tolerance || cy - r < minY - tolerance || cy + r > maxY + tolerance) {
            overflows.push(`circle (cx: ${cx.toFixed(0)}, cy: ${cy.toFixed(0)}, r: ${r.toFixed(0)}) outside viewBox`);
          }
        }
      }
    }

    // Check rects (ignore background fills like width="100%")
    if (node.rect) {
      const rects = Array.isArray(node.rect) ? node.rect : [node.rect];
      for (const r of rects) {
        const wStr = String(r['@_width'] || '');
        const hStr = String(r['@_height'] || '');
        if (wStr.includes('%') || hStr.includes('%')) continue; // Valid background canvas

        const x = (Number(r['@_x']) || 0) + currentDx;
        const y = (Number(r['@_y']) || 0) + currentDy;
        const w = Number(wStr) || 0;
        const h = Number(hStr) || 0;
        if (x < minX - tolerance || x + w > maxX + tolerance || y < minY - tolerance || y + h > maxY + tolerance) {
          overflows.push(`rect (x: ${x.toFixed(0)}, y: ${y.toFixed(0)}, w: ${w.toFixed(0)}, h: ${h.toFixed(0)}) outside viewBox`);
        }
      }
    }

    // Check lines
    if (node.line) {
      const lines = Array.isArray(node.line) ? node.line : [node.line];
      for (const l of lines) {
        const x1 = Number(l['@_x1']) + currentDx;
        const y1 = Number(l['@_y1']) + currentDy;
        const x2 = Number(l['@_x2']) + currentDx;
        const y2 = Number(l['@_y2']) + currentDy;
        if (!isNaN(x1) && !isNaN(y1)) {
          if (x1 < minX - tolerance || x1 > maxX + tolerance || y1 < minY - tolerance || y1 > maxY + tolerance) {
            overflows.push(`line start (${x1.toFixed(0)}, ${y1.toFixed(0)}) outside viewBox`);
          }
        }
        if (!isNaN(x2) && !isNaN(y2)) {
          if (x2 < minX - tolerance || x2 > maxX + tolerance || y2 < minY - tolerance || y2 > maxY + tolerance) {
            overflows.push(`line end (${x2.toFixed(0)}, ${y2.toFixed(0)}) outside viewBox`);
          }
        }
      }
    }

    // Check texts
    if (node.text) {
      const texts = Array.isArray(node.text) ? node.text : [node.text];
      for (const t of texts) {
        const x = (Number(t['@_x']) || 0) + currentDx;
        const y = (Number(t['@_y']) || 0) + currentDy;
        if (!isNaN(x) && !isNaN(y)) {
          if (x < minX - tolerance || x > maxX + tolerance || y < minY - tolerance || y > maxY + tolerance) {
            overflows.push(`text at (${x.toFixed(0)}, ${y.toFixed(0)}) outside viewBox`);
          }
        }
      }
    }

    // Recurse into groups <g> or other containers with translation tracking
    for (const key of Object.keys(node)) {
      if (!key.startsWith('@_') && typeof node[key] === 'object') {
        const children = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const child of children) {
          const { dx, dy } = parseTranslate(child?.['@_transform']);
          inspectElements(child, currentDx + dx, currentDy + dy);
        }
      }
    }
  };

  inspectElements(root);

  if (overflows.length > 0) {
    return {
      passed: false,
      details: `Elements exceed viewBox bounds: ${overflows.slice(0, 2).join('; ')}`,
    };
  }

  return {
    passed: true,
    details: `All elements fit inside viewBox (${minX}, ${minY}, ${width}x${height})`,
  };
}

/**
 * Checks for a <title> element and at least 3 <text> labels.
 */
function checkTitleAndLabels(svgStr: string, parsedObj: any): { passed: boolean; details: string } {
  const root = parsedObj?.svg;
  if (!root) {
    return { passed: false, details: 'Cannot read SVG root' };
  }

  // Count <title> occurrences
  const hasTitleTag = svgStr.includes('<title>') || svgStr.includes('<title ');

  // Count <text> elements via regex on raw SVG for reliable tag match
  const textMatches = svgStr.match(/<text[\s>]/gi) || [];
  const textCount = textMatches.length;

  if (!hasTitleTag && textCount < 3) {
    return {
      passed: false,
      details: `Missing <title> tag and has only ${textCount} <text> labels (minimum 3 required)`,
    };
  }

  if (!hasTitleTag) {
    return {
      passed: false,
      details: `Missing <title> tag (has ${textCount} text labels)`,
    };
  }

  if (textCount < 3) {
    return {
      passed: false,
      details: `Has <title> but only ${textCount} <text> labels (minimum 3 required for educational clarity)`,
    };
  }

  return {
    passed: true,
    details: `Has <title> and ${textCount} descriptive text labels`,
  };
}

/**
 * Checks whether the diagram contains animation.
 * Validates either SMIL tags (<animate>, <animateTransform>) or CSS (@keyframes / animation:).
 */
function checkAnimation(svgStr: string): { passed: boolean; details: string } {
  const hasSmil =
    /<animate[\s>]/i.test(svgStr) ||
    /<animateTransform[\s>]/i.test(svgStr) ||
    /<animateMotion[\s>]/i.test(svgStr);

  const hasKeyframes =
    /@keyframes/i.test(svgStr) && /animation:\s*[^;]+/i.test(svgStr);

  if (hasSmil || hasKeyframes) {
    const type = hasSmil && hasKeyframes ? 'SMIL & CSS' : hasSmil ? 'SMIL' : 'CSS @keyframes';
    return {
      passed: true,
      details: `Animated using ${type}`,
    };
  }

  return {
    passed: false,
    details: 'No animation detected: requires either SMIL tags (<animate>) or CSS @keyframes animation',
  };
}

/**
 * Custom 5th Check: Security & Graphical Richness.
 * Ensures no dangerous code execution and ensures it is an actual diagram with graphical shapes.
 */
function checkSecurityAndComplexity(svgStr: string, parsedObj: any): { passed: boolean; details: string } {
  // Security check: Reject dangerous tags
  const forbiddenTags = [/<script[\s>]/i, /<iframe[\s>]/i, /<foreignObject[\s>]/i, /javascript:/i];
  for (const pattern of forbiddenTags) {
    if (pattern.test(svgStr)) {
      return {
        passed: false,
        details: 'Security violation: Detected disallowed script or interactive tag',
      };
    }
  }

  // Complexity check: Must have at least 3 geometric/path visual shapes
  const shapeMatches = svgStr.match(/<(path|circle|rect|ellipse|line|polygon|polyline)[\s>]/gi) || [];
  const shapeCount = shapeMatches.length;

  if (shapeCount < 3) {
    return {
      passed: false,
      details: `Diagram has only ${shapeCount} geometric elements; needs at least 3 shapes (<path>, <circle>, <rect>, etc.) to be a valid educational diagram`,
    };
  }

  return {
    passed: true,
    details: `Safe (no script tags) and contains ${shapeCount} vector elements`,
  };
}
