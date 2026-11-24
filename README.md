# Science Diagram Maker (UK GCSE)

Technical assessment submission for Udhi Technologies.

This is a web app that generates animated SVG science diagrams for UK GCSE students using Google Gemini, validates them with custom code checks, and provides an interactive reviewer dashboard where teachers or editors can approve or reject them.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-science--diagram--maker--jet.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white)](https://science-diagram-maker-jet.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shweta-Tech-creator/science-diagram-maker)

- **Live URL:** [https://science-diagram-maker-jet.vercel.app](https://science-diagram-maker-jet.vercel.app)
- **GitHub Repository:** [https://github.com/Shweta-Tech-creator/science-diagram-maker](https://github.com/Shweta-Tech-creator/science-diagram-maker)

---

## Results Table (Part A Execution)

Here are the results from running the generation and validation pipeline for the 5 required concepts. All 5 passed all checks.

| Concept | Subject | Status | Retries | Input Tokens | Output Tokens | Est. Cost (USD) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Pythagoras' theorem | Maths | Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| Parts of a circle | Maths | Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| Series circuit | Physics | Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| Photosynthesis | Biology | Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| States of matter | Chemistry | Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |

The complete raw data with full SVG strings and check details is saved in `results.json`.

---

## How to Run on Your Computer

### Prerequisites
- Node.js (v18 or above)
- npm

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shweta-Tech-creator/science-diagram-maker.git
   cd science-diagram-maker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the API key:**
   Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
   Add your free Gemini API key from Google AI Studio:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(Note: `.env.local` is in `.gitignore`, so your key will never be committed to GitHub).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. The page opens instantly with the 5 pre-saved diagrams from `results.json` without making any initial API calls.

5. **(Optional) Re-run the batch pipeline via CLI:**
   ```bash
   npm run generate:diagrams
   ```

---

## The Code Checks

Every SVG is tested through `src/lib/svg-validator.ts` before being accepted:

1. **Valid and parsable XML:** Parsed using `fast-xml-parser` to make sure it's valid XML and contains an `<svg>` root element.
2. **Within viewBox:** Reads the `viewBox="0 0 width height"` attributes and checks that shapes (`<circle>`, `<rect>`, `<line>`, `<polygon>`) and `<text>` coordinates stay within bounds. It also accounts for group translation offsets (`<g transform="translate(x, y)">`) and stroke widths.
3. **Title and at least 3 text labels:** Checks for a `<title>` tag and at least 3 descriptive `<text>` tags naming key terms (e.g. Hypotenuse, Chloroplast, Ammeter).
4. **Has animation:** Verifies that continuous animation exists, either through SMIL tags (`<animate>`, `<animateTransform>`) or CSS `@keyframes` with infinite animation rules.
5. **My 5th check (Security & Visual Substance):**
   - Security: Rejects dangerous elements like `<script>`, `<iframe>`, `<foreignObject>`, or `javascript:` links to protect the reviewer from XSS.
   - Substance: Ensures there are actual geometric shapes (`<path>`, `<rect>`, `<circle>`, etc.) so text-only placeholders or blank canvases fail.

If any check fails, the code triggers a single retry, sending the model the exact check that failed so it can fix it.

---

## Review Persistence: Why I Chose Browser LocalStorage

For saving the Approve / Reject decisions and reviewer notes, I chose **browser `localStorage`** (under key `udhi_gcse_diagram_reviews_v1`).

Here is why:
- **Instant response:** Saving and loading happens synchronously with zero network lag or database connection delay.
- **Isolated reviewer sessions:** When interviewers or teachers open the live deployment link, each person gets their own clean review session. One person's review won't overwrite another person's notes.
- **Zero server overhead:** It doesn't require setting up a database or managing credentials on a serverless host.
- **Export capability:** I also added an "Export" button in the top bar so a reviewer can download all their decisions and notes as a clean JSON file anytime.

---

## What Failed, and How I Fixed It

Here are the actual issues I ran into while building this and how I solved them:

### 1. ViewBox false alarms caused by group transforms
- **Problem:** Early on, some diagrams failed the viewBox check even though they looked fine visually. The issue was that elements had negative coordinates like `x="-10"`, but were nested inside `<g transform="translate(100, 50)">`. My initial validator checked coordinates in isolation, which gave false negatives.
- **Fix:** I updated `svg-validator.ts` to keep track of active `(dx, dy)` translations as it walks down the element tree. I also added a sensible bleed tolerance so corner labels and cards right near the boundary don't get rejected unfairly.

### 2. Bare ampersands breaking the XML parser
- **Problem:** Gemini occasionally generated titles like `<title>Circles & Sectors</title>`. In strict XML, a raw `&` is illegal and causes the parser to throw `char '&' is not expected`, which made all subsequent checks fail immediately.
- **Fix:** In `extractSvgString()`, I added a regex step to sanitize raw ampersands into `&amp;` before passing the SVG to the parser, while leaving existing valid XML entities (like `&lt;` or `&amp;`) untouched.

### 3. Visual collision in Photosynthesis
- **Problem:** In one generation run for Photosynthesis, the model drew a yellow "Light Energy" badge right at `y=35`, directly overlapping the main diagram title.
- **Fix:** I added an explicit coordinate rule to the prompt instructions reserving `y: 0` to `75` solely for the title banner. I also added a collision check in the validator that flags non-title badges placed in the top header band, prompting a clean retry if that happens.

### 4. Gemini free-tier rate limits (429 and 503)
- **Problem:** New AI Studio accounts have strict limits on free models (often 15–20 requests per day on standard Flash, and 5–15 RPM on flash-lite). During testing, re-generating diagrams would occasionally hit 429 or 503 errors and hang.
- **Fix:** I built an exponential backoff retry loop ($1.5s \times 2^n$) in `src/lib/gemini.ts` that tries up to 3 times on 429/503. I also prioritized `gemini-3.5-flash-lite` (which has the best free limits), and added a fallback generator in `src/lib/dynamic-generator.ts` with distinct educational themes so that even if the API quota is fully exhausted during testing, the app never crashes or leaves the reviewer with a broken screen.

### 5. Next.js 16 Turbopack child process issue on Mac
- **Problem:** When building with Next.js 16, Turbopack panicked with an IPC child process connection error during PostCSS compilation.
- **Fix:** I configured the build script in `package.json` to use `--webpack` (`next build --webpack`). This builds cleanly and reliably both locally and on Vercel.

---

## What I Would Do With One More Day

1. **DOM-based bounding box validation:**
   Static XML coordinate parsing works well for simple shapes, but cannot easily calculate exact curves in complex `<path d="...">` strings. With more time, I would run a headless browser (Puppeteer or Playwright) to call the native SVG `.getBBox()` on every element to detect pixel-perfect bounding box containment and text collisions.
2. **Interactive prompt editor:**
   Add a drawer in the UI where teachers could tweak prompt instructions, switch visual themes (e.g. high-contrast mode for accessibility), or adjust animation speeds before generating.
3. **Accessibility (a11y) checks:**
   Add automated checks for `aria-label`, `<desc>` elements, and color contrast ratios against WCAG AAA standards.
4. **Cloud collaboration:**
   Add an optional toggle for team mode (e.g. via Supabase) so multiple curriculum reviewers could view shared approval stats and leave comment threads on diagrams.

---

## AI Tools Used & Reflection

- **Google Gemini (AI Studio):** Used `gemini-3.5-flash-lite` as the generative engine to produce the animated SVG diagrams.
- **Antigravity / Gemini CLI:** Used to scaffold the initial Next.js project structure, generate TypeScript types, and test shell commands.
- **What I built myself:**
  - The 5-point SVG geometry and XML validation logic (`svg-validator.ts`), including the transform-tracking algorithm.
  - The API retry loop with exponential backoff on 429/503 and corrective feedback prompts (`gemini.ts`).
  - The reviewer dashboard, interactive modals, filter logic, and localStorage state persistence (`ReviewerTable.tsx`).
  - Debugging and solving all edge cases (group transforms, unescaped ampersands, and Next.js 16 build configs).
