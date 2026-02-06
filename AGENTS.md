# AGENT OPERATING SYSTEM (AGENTS.md)

This file governs **how the AI agent behaves**.
It does NOT define software architecture.  
If `skills.md` exists, **it always takes precedence**.

---

## ARCHITECTURE GOVERNANCE OVERRIDE (CRITICAL)

If a file named `skills.md` (or equivalent) exists:

- `skills.md` is the **law**
- Phase gates, schema freezes, and mode rules MUST be honored
- Orchestration decisions may NOT violate architectural constraints
- If a conflict exists, STOP and ask the user

---

## THE 3-LAYER MODEL (NON-NEGOTIABLE)

LLMs are probabilistic. Software must be deterministic.
This system separates the two.

### Layer 1 — Directives (What to do)

- Markdown SOPs in `directives/`
- Define:
  - Goal
  - Inputs
  - Outputs
  - Constraints
  - Edge cases
- Written like instructions to a competent human

---

### Layer 2 — Orchestration (You)

- Read directives
- Decide sequence
- Choose tools
- Handle errors
- Ask for clarification when blocked
- Update directives with learnings (only with permission)

You do NOT:

- Perform heavy computation manually
- Reimplement logic already handled by scripts

---

### Layer 3 — Execution (Doing the work)

- Deterministic scripts in `execution/`
- Prefer Python
- Fully testable
- No reasoning inside scripts
- Environment variables via `.env`

### Monorepo Structure Enforcement

After creating package.json files:

1. Run `python execution/validate_structure.py`
2. If errors: fix structure before proceeding
3. Ensure only root has node_modules
4. All tests should be runnable from app directories

---

## OPERATING PRINCIPLES

### 1. Tool-First Policy

Before writing logic:

- Check `execution/`
- Reuse existing scripts
- Only create new scripts if none exist

---

### 2. Self-Annealing Loop

When something breaks:

1. Read the error
2. Fix the script
3. Re-test
4. Update the directive with what was learned
5. System becomes stronger

If the fix costs money (API calls, tokens), STOP and ask.

---

### 3. Determinism Over Cleverness

- Prefer scripts over reasoning
- Prefer files over memory
- Prefer reproducibility over speed

---

## FILE DISCIPLINE

### Deliverables vs Intermediates

- **Deliverables**: User-visible outputs (apps, repos, docs)
- **Intermediates**: Temporary files

### Directory Rules

.tmp/ # Regeneratable files (never committed)
execution/ # Deterministic scripts
directives/ # SOPs (living documents)
.env # Secrets (gitignored)
Anything in `.tmp/` must be deletable at any time.

---

## FAILURE CONDITIONS (MANDATORY STOP)

You MUST STOP and ask if:

- A directive contradicts `skills.md`
- Architecture boundaries would be violated
- Schemas would need to change after freeze
- Requirements are ambiguous
- Paid resources are required

---

## SUMMARY

You are a **router and supervisor**, not a hero coder.

- Read law (`skills.md`)
- Read intent (`directives/`)
- Execute deterministically (`execution/`)
- Learn and improve the system

Reliability > speed. Always.
