# Talent Match AI

![Talent Match AI](public/talentmatch-logo.png)

An explainable, full-stack recruitment intelligence platform that compares a candidate resume with a job description and returns a weighted compatibility report, skill-gap plan, tailored cover-letter draft, and interview questions.

**Live demo:** https://talentmatch-ai.tanmayboptmtips.chatgpt.site

## Why this project exists

Most ATS demos return an unexplained percentage. Talent Match AI makes the scoring model visible and keeps every recommendation grounded in evidence from the resume. It is designed as a production-style portfolio project rather than a black-box chatbot.

## Features

- PDF, DOCX, and TXT extraction in the browser
- Secure, validated analysis API
- Deterministic NLP skill and keyword extraction
- Weighted match scoring across five dimensions
- Matched and missing skill identification
- Evidence-based resume improvements
- Tailored cover-letter draft
- Role-specific technical and behavioral interview questions
- Optional Sign in with ChatGPT
- User-owned analysis history stored in Cloudflare D1
- Responsive and accessible interface
- Automated tests for the scoring engine

## Technology

- **Frontend:** React 19, TypeScript, Vinext/Next.js, Tailwind CSS, Shadcn UI
- **Document processing:** PDF.js and Mammoth.js
- **Backend:** Server route handlers deployed to Cloudflare Workers
- **Data:** Cloudflare D1 with Drizzle ORM
- **Validation:** Zod
- **Testing:** Vitest
- **Hosting:** ChatGPT Sites

## Scoring model

| Dimension | Weight |
|---|---:|
| Technical skills | 40% |
| Experience alignment | 25% |
| Keyword alignment | 15% |
| Education evidence | 10% |
| Project evidence | 10% |

The score is an application-preparation aid, not a hiring decision. The engine does not invent candidate experience.

## Local setup

```bash
pnpm install
pnpm run db:generate
pnpm run dev
```

Run tests:

```bash
pnpm test
```

Build the production worker:

```bash
pnpm run build
```

## Project structure

```text
app/
  api/analyze/route.ts    Validated analysis endpoint
  api/history/route.ts    Authenticated history endpoint
  workspace.tsx           Resume analysis product interface
db/
  schema.ts               D1 database schema
lib/
  analysis.ts             Explainable NLP scoring engine
  analysis.test.ts        Automated unit tests
docs/
  architecture.md         System design and data flow
  api.md                  API contract
drizzle/                  Versioned database migrations
```

## Privacy and security

- File text extraction occurs in the visitor's browser.
- Raw resume text is sent only for the requested analysis and is not persisted.
- Only compact report metadata is saved, and only for signed-in users.
- API inputs have strict length and type validation.
- User-owned history is filtered by the authenticated user ID on the server.

## Roadmap

- Semantic embeddings for skill equivalence
- Configurable scoring profiles by role family
- Exportable PDF reports
- Recruiter workspace for multi-candidate comparison

## Author

**Ankita Chakraborty** — Full-Stack Developer and AI Engineer

## License

MIT
