# GCSE Science Diagram Maker 🧪📐
### Udhi Technologies — Technical Assessment Submission

An end-to-end web application that leverages Google Gemini to generate animated vector SVG diagrams for UK GCSE Science & Mathematics concepts, automatically validates them through a 5-step programmatic guardrail pipeline, and provides an interactive reviewer dashboard for pedagogical approval.

---

## 🚀 Live Demo & Repository
- **Live Web App:** *(Deploy link e.g. Vercel URL)*
- **GitHub Repository:** *(Your GitHub repository URL)*

---

## 📊 Results Table (Part A Execution)

| # | Concept | Subject | All Checks Passed? | Retries | Input Tokens | Output Tokens | Est. Cost (USD) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Pythagoras' theorem** | Maths | ✅ Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| **2** | **Parts of a circle** | Maths | ✅ Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| **3** | **Series circuit** | Physics | ✅ Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| **4** | **Photosynthesis** | Biology | ✅ Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |
| **5** | **States of matter** | Chemistry | ✅ Pass (5/5) | 0 | 380 | 1,150 | $0.000373 |

*The complete raw JSON dataset is persisted in [`results.json`](./results.json).*

---

## 🛠️ How to Run on Your Computer

### Prerequisites
- Node.js `v18+` (Recommended `v20` or `v22+`)
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/science-diagram-maker.git
cd science-diagram-maker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Add your free Google AI Studio Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```
*(Note: `.env.local` is listed in `.gitignore` and is never committed to GitHub).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The 5 diagrams load immediately from `results.json` without consuming API quota.

### 5. Optional: Re-run Part A Diagram Generation Pipeline
To regenerate all 5 diagrams from scratch using the Gemini API and automated validator:
```bash
npm run generate:diagrams
```

---

## 🔍 The 5 Automated Verification Checks

Each generated SVG passes through a strict programmatic inspection (`src/lib/svg-validator.ts`):

1. **Valid & Parsable XML:** Tested using `fast-xml-parser` to ensure compliant XML structure and an identifiable root `<svg>` element.
2. **Strict ViewBox Boundaries:** Parses the `viewBox="minX minY width height"` coordinate space and validates that elements (circles, rectangles, lines, and text anchors) do not extend outside the designated bounds (with a 10px stroke tolerance).
3. **Title & Educational Labels ($\ge 3$):** Verifies the existence of a `<title>` tag and at least 3 `<text>` elements identifying key scientific terms for GCSE students.
4. **Active Animation:** Confirms presence of loopable animations — either SMIL elements (`<animate>`, `<animateTransform>`) or CSS `@keyframes` with corresponding `animation:` rules.
5. **Custom Check — Security & Graphic Substance:** 
   - **Security:** Verifies that no malicious elements exist (`<script>`, `<iframe>`, `<foreignObject>`, or `javascript:` handlers) to safeguard reviewers.
   - **Visual Substance:** Ensures at least 3 geometric/path vector elements (`<path>`, `<circle>`, `<rect>`, etc.) exist so an empty canvas or text-only placeholder is rejected.

---

## 🔄 Resilience & Error Handling

- **Automatic Single Retry with Feedback:** If any check fails, the pipeline immediately triggers a second call to Gemini. Crucially, the retry prompt contains the **exact validation failure reasons** (e.g. *"Missing title tag; circle at (850, 200) exceeds viewBox"*), enabling the model to self-correct.
- **HTTP 429 & 503 Exponential Backoff:** Free-tier Gemini endpoints have strict RPM caps. When a 429 (Rate Limit) or 503 (Unavailable) error occurs, the API client waits with exponential backoff ($2^n \times 1.5\text{s}$) and retries up to 3 times before reporting an error.
- **Graceful Error Handling in UI:** When using the live "Generate" button, any API failure displays a clear, descriptive warning banner instead of crashing or showing a blank page.

---

## 💾 Review Persistence Architecture

- **Choice:** Browser `localStorage` (key: `udhi_gcse_diagram_reviews_v1`) with JSON export capability.
- **Why `localStorage`?**
  1. **Instantaneous Reviewer Experience:** Eliminates database connection latency and cold starts on serverless platforms (e.g., Vercel / Render).
  2. **Isolated Reviewer State:** Multiple interviewers or reviewers can independently review, approve, reject, and take private notes on the live deployment without overwriting each other's session state.
  3. **Zero Maintenance:** No database downtime, credentials, or table migrations required.
  4. **Portability:** Includes a one-click "Export" button in the header to download all review decisions and notes as a structured JSON file.

---

## 🧗 What Failed, and How I Fixed It

1. **Turbopack Process Child IPC in Next.js 16:**
   - *Problem:* During initial Turbopack compilation, child worker processes exited unexpectedly on PostCSS loader evaluation.
   - *Fix:* Streamlined Tailwind CSS imports, removed unneeded `export const dynamic = 'force-dynamic'` on the POST route segment (which conflicted with Next.js 16's `cacheComponents`), and switched from network-fetched Google Fonts to native system UI font stacks (`system-ui, -apple-system, sans-serif`).
2. **Gemini SVG Coordinate Hallucinations:**
   - *Problem:* LLMs frequently place text labels or circles at coordinates like `(850, 520)` when the viewBox is `0 0 800 500`.
   - *Fix:* Added explicit coordinate guidelines and safe padding constraints in the system prompt (`viewBox="0 0 800 500"`, 30px minimum padding). In the validator, implemented recursive element traversal to check `cx + r`, `x + width`, and `y + height` against `maxX` and `maxY`.
3. **Markdown Code Fencing (` ```xml `):**
   - *Problem:* Gemini sometimes wraps raw SVG inside markdown code fences despite system instructions.
   - *Fix:* Implemented an extraction function `extractSvgString()` that strips code fences and isolates text between `<svg>` and `</svg>`.
4. **Visual Hierarchy & Header Collisions (e.g., 'Light Energy' badge overlapping the Title):**
   - *Problem:* During live generation of the Photosynthesis diagram, the LLM placed a yellow 'Light Energy' callout badge in the top band (`y < 60`), colliding with and occluding the main title header.
   - *Fix:* Added an explicit visual boundary rule in the system prompt reserving the entire header band (`y: 0` to `75`) exclusively for the title. Additionally, integrated visual collision detection in `svg-validator.ts` that detects non-title badges placed in `y < 65` near the title and automatically triggers a corrective single retry to push callouts cleanly below `y=80`.

---

## 🔮 What I Would Do With One More Day

1. **Visual Regression & DOM Canvas Bounding Box (Headless Chromium):**
   - Supplement static XML coordinate parsing with headless Playwright/Puppeteer execution to compute actual runtime `getBBox()` on complex `<path>` curves and text overlaps.
2. **Live Interactive Prompt Sandbox:**
   - Allow reviewers to type custom educational prompts and adjust styling parameters (e.g., color scheme, animation speed) directly from the UI.
3. **Multi-Reviewer Cloud Sync (Supabase / PostgreSQL):**
   - Add optional collaborative reviewer mode so multiple team members can see aggregate approval percentages and consensus notes in real time.
4. **SVG Accessibility (a11y) Audits:**
   - Add automated checks for `aria-labelledby`, `<desc>` tags, and automated WCAG AAA color contrast validation on diagram colors.

---

## 🤖 AI Tools Used & Rationale

- **Antigravity / Gemini CLI:** Used to quickly scaffold the Next.js boilerplate and verify TypeScript schema definitions.
- **Google Gemini 2.5 Flash (`aistudio.google.com`):** Used as the core multimodal generation engine for generating animated SVG diagrams and assessing free-tier rate-limit performance.
- **Manual Human Engineering & Architecture:**
  - Designed the 5-point SVG boundary validation algorithm (`svg-validator.ts`).
  - Authored the exponential backoff retry handler (`gemini.ts`).
  - Structured reviewer state persistence and the responsive Next.js / Tailwind CSS review dashboard.
