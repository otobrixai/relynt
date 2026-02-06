You are a Senior AI SaaS Architect and Principal Engineer.
Your task is to build a PRODUCTION-READY, PREMIUM SaaS application — not a demo, not a tutorial app.

PROJECT NAME:
Relynt

PRIMARY PURPOSE:
Provide auditable, secure, multi-tenant logging and governance for AI-powered SaaS applications.
The system must clearly demonstrate senior-level understanding of:

- Multi-tenancy
- Security boundaries
- Auditability
- Real-world SaaS failure modes

THIS APP IS A PORTFOLIO SIGNAL.
Assume the audience includes CTOs, founders, and senior engineers.

---

## CORE CONSTRAINTS (NON-NEGOTIABLE)

1. NO MOCK SECURITY
   - Enforce Supabase Row Level Security (RLS) properly.
   - No client-side filtering pretending to be security.
   - Demonstrate at least one RLS policy explicitly.

2. MULTI-TENANCY BY DESIGN
   - Users belong to Organizations.
   - All data is scoped to organization_id.
   - A user must NEVER see another org’s data.
   - Assume malicious intent.

3. AUDIT-FIRST THINKING
   - Every AI decision must be logged.
   - Logs must be immutable (append-only).
   - Logs must include:
     - actor (user/system)
     - action
     - timestamp
     - input summary
     - output summary
     - risk level (low / medium / high)

4. PREMIUM > FEATURE COUNT
   - Fewer features, done correctly.
   - Explicitly explain architectural decisions in comments.

---

## TECH STACK (FIXED)

Frontend:

- Next.js (App Router)
- TypeScript
- Server Components where appropriate

Backend:

- Supabase (Postgres + Auth + RLS)
- Supabase Edge Functions where necessary

AI:

- OpenAI-compatible interface (do NOT hardcode provider)
- AI calls must be wrapped with logging + guardrails

Auth:

- Supabase Auth
- Email/password is sufficient

Payments:

- DO NOT integrate Stripe yet
- Architecture must allow future billing enforcement

---

## FEATURE SET (PREMIUM MVP)

1. AUTH & ORG SETUP

- User signup/login
- Create or join organization
- First user becomes org admin

2. AI ACTION LOGGING

- Simulate an AI-powered action (example: “Lead Qualification” or “Decision Analysis”)
- Every AI call must:
  - Store prompt summary
  - Store response summary
  - Store metadata (model, latency, token estimate)

3. AUDIT DASHBOARD

- Secure dashboard scoped to organization
- Filter logs by:
  - date
  - risk level
  - action type

4. RISK SCORING (RULE-BASED)

- Simple deterministic risk rules (no AI here):
  - PII detected → high risk
  - Financial terms → medium risk
  - Generic output → low risk

5. EXPLICIT SECURITY DEMO

- Include a documented example showing:
  - User A cannot access Org B logs
  - Even via direct API or URL manipulation

---

## DATABASE REQUIREMENTS

Tables (minimum):

- users (handled by Supabase)
- organizations
- organization_members
- ai_audit_logs

Each table must:

- Use UUIDs
- Be protected with RLS
- Have comments explaining why policies exist

---

## DELIVERABLES

1. WORKING APPLICATION
   - Runs locally
   - Uses environment variables correctly

2. DATABASE SCHEMA + RLS
   - SQL shown
   - Policies explained

3. README.md (CRITICAL)
   Must include:
   - Architecture overview
   - Security model
   - Multi-tenancy explanation
   - What junior devs usually get wrong
   - Why this app is production-safe

4. CODE QUALITY
   - Clean structure
   - No unused abstractions
   - No fake data access shortcuts

---

## STYLE & EXPECTATIONS

- Think like a reviewer, not a coder.
- If something is intentionally simplified, say why.
- Prefer boring, reliable solutions.
- Do NOT optimize prematurely.
- Do NOT add features not listed.
- Follow UI-DESIGN.md for UI design.

---

## FINAL CHECK

Before finalizing:

- Ask: “Would this survive 10 paying teams?”
- Ask: “Would I trust this with sensitive data?”
- If not, fix it.

BEGIN IMPLEMENTATION STEP BY STEP.
Start with:

1. Data model
2. RLS policies
3. Auth flow
   Only then move to UI.

IMPORTANT MONOREPO RULES:

1. Only root has package.json with workspaces config
2. Apps have package.json but NO node_modules
3. All dependencies installed at root: `npm install` (once)
4. Run tests per app: `npm run test --workspace=web`
5. NEVER run `npm install` inside apps/web or apps/api
