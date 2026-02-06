# SKILLS.md (v3.0) - Architectural Law

## 🏛️ ARCHITECTURAL LAW

This file governs **what** is built. `AGENTS.md` governs **how** it's built.
In case of conflict, this file wins.

## ⚠️ IMPORTANT: READ THIS FIRST

Before writing ANY code, the agent must:

1. Read this entire file
2. Confirm understanding
3. Wait for user approval to proceed

---

## 🎯 OBJECTIVE

Build a production-ready full-stack application with clean architecture, proper testing, and maintainable code.

---

## 📋 PHASE GATES (NON-NEGOTIABLE)

### **PHASE 0: ARCHITECTURE DESIGN** (ARCHITECT MODE)

**What happens:**

- Define data models/schemas
- Plan component hierarchy
- Design API contracts
- Choose technologies

**Deliverables:**

1. `docs/architecture.md` with:
   - System diagram (Mermaid format)
   - Data flow diagrams
   - Technology choices with justifications (include alternatives considered)
   - API endpoints specification (method, path, request/response schemas)
   - Assumptions & risks table
2. `shared/schemas/` with type definitions (Zod, TypeScript, or chosen schema format)
3. Database schema design (if applicable)
4. Testing strategy document

**FREEZE POINTS:**

- ✅ **Schema Freeze**: After Phase 0, schemas cannot change without formal change request
- ✅ **Architecture Freeze**: After Phase 1, architecture cannot change

**NOT ALLOWED:**

- Writing actual application code
- Creating implementation details
- Skipping to "fun parts"

---

### **PHASE 1: FOUNDATION** (ENGINEER MODE)

**What happens:**

- Set up monorepo structure
- Configure build tools
- Create shared packages
- Set up testing framework
- Implement CI/CD basics
- Establish single source of truth

**Deliverables:**

1. Working monorepo with:
   - `apps/web/` (frontend)
   - `apps/api/` (backend)
   - `shared/` (shared code with schemas)
2. Build system (npm workspaces, vite, etc.)
3. Test framework configured with example tests
4. Development environment
5. All shared schemas implemented in `shared/` folder
6. Example import/export patterns between layers

**RULES:**

- No business logic yet
- Only infrastructure
- Everything must be testable
- Single source of truth: All shared types must originate from `shared/`

**Monorepo Structure Rules:**

- Root `package.json` uses `npm workspaces` or `yarn workspaces`
- Apps have `package.json` but **NO node_modules**
- All dependencies hoisted to root `node_modules`
- Root `package.json` contains ONLY workspace config and shared dev tools
- App `package.json` contains ONLY app-specific dependencies

---

### **PHASE 2: CORE IMPLEMENTATION** (ENGINEER MODE)

**What happens:**

- Implement data layer
- Create core services
- Build essential components
- Set up state management

**Deliverables:**

1. Working data access layer
2. Core business logic services
3. Essential UI components (unstyled, functional)
4. State management setup
5. Integration tests for core flows

**RULES:**

- Follow schemas exactly (frozen in Phase 0)
- Write tests for everything
- No shortcuts on error handling
- All frontend-backend communication uses shared schemas

---

### **PHASE 3: FEATURE DEVELOPMENT** (ENGINEER MODE)

**What happens:**

- Implement user-facing features
- Connect frontend to backend
- Add authentication (if needed)
- Implement UI polish
- Add comprehensive error handling

**Deliverables:**

1. Complete feature set
2. Working frontend-backend integration
3. Styling system with design tokens
4. End-to-end test suite
5. Error boundaries and user feedback

---

### **PHASE 4: POLISH & DEPLOY** (ENGINEER MODE)

**What happens:**

- Performance optimization
- Security hardening
- Documentation
- Deployment setup
- Final testing and validation

**Deliverables:**

1. Production-ready application
2. Deployment configuration for at least one environment
3. Complete documentation (API docs, setup guide, architecture docs)
4. Performance benchmarks and optimization report
5. Security audit checklist

---

## 🏗️ ARCHITECTURAL CONSTRAINTS

### 1. CLEAN ARCHITECTURE LAYERS (MANDATORY)

```
Presentation → Application → Domain → Infrastructure
        ↓           ↓           ↓           ↓
     UI/API   Use Cases   Business Rules   DB/External
```

**Rules:**

- Dependencies point inward (infrastructure → domain → application → presentation)
- Outer layers can depend on inner layers
- Inner layers NEVER depend on outer layers
- Domain layer must be framework-agnostic
- Infrastructure layer contains all external dependencies (DB, APIs, services)

---

### 2. SINGLE SOURCE OF TRUTH (CRITICAL)

- All shared data structures must live in `shared/` folder
- Frontend and backend must import from `shared/` exclusively for shared types
- No duplicated or inferred types allowed
- Schema changes require formal change request after Phase 0
- Validation schemas must be runtime-checked at boundaries

---

### 3. DATA FLOW RULES

- Frontend → Backend: REST/GraphQL with typed contracts from `shared/`
- Backend → Database: Repository pattern with clear separation
- Services → External APIs: Adapter pattern with circuit breakers
- All data transformations: Pure functions with tests
- All API responses and requests must validate against shared schemas

---

### 4. ERROR HANDLING (NON-NEGOTIABLE)

- **User errors**: Clear, actionable messages (no stack traces)
- **System errors**: Logged with full context, generic user message shown
- **Validation errors**: Client-side first, server-side always
- **Network errors**: Automatic retry with exponential backoff (configurable)
- **Boundary errors**: Schema validation failures must log mismatch details
- All errors must have unique codes for debugging

---

## 🔧 MODE SWITCHING

### **ARCHITECT MODE** (Thinking Phase)

- Only in Phase 0
- Creates plans, schemas, designs
- NO CODE IMPLEMENTATION
- Must produce reviewable artifacts
- Focuses on "what" and "why", not "how"

### **ENGINEER MODE** (Building Phase)

- Phases 1-4
- Follows architecture exactly
- Cannot change schemas without approval
- Implements, tests, delivers
- Focuses on "how" with excellence

**MODE TRANSITION:**

- Architect → Engineer: After Phase 0 approval
- Engineer → Architect: NEVER (once schemas are frozen)
- If architecture changes needed: FORMAL CHANGE REQUEST required

---

## 📝 CHANGE REQUEST PROCESS

If something needs to change after freeze:

1. **Create** `docs/change_requests/CR-{YYYYMMDD}-{seq}.md`
2. **Describe** what needs to change and why (business justification)
3. **Analyze** impact on existing code (list all affected files)
4. **Propose migration path** for existing data
5. **Wait** for user approval
6. **Update** all affected files atomically in single phase
7. **Update documentation** to reflect changes

**Change Request Template:**

```markdown
# Change Request: [Brief Description]

## Reason for Change

[Why this is necessary]

## Impact Analysis

- Files affected: [list]
- Migration required: [yes/no]
- Breaking changes: [yes/no]

## Proposed Implementation

[How to implement]

## Rollback Plan

[How to revert if needed]

## Approval

- [ ] Approved by: **\_**
- [ ] Date: **\_**
```

---

## 🚨 STOP CONDITIONS (MANDATORY)

Agent MUST STOP and ask for clarification if:

1. **Schema violation**: Trying to change schema after Phase 0 without change request
2. **Architecture violation**: Breaking clean architecture layers
3. **Single source violation**: Duplicating types or creating parallel schemas
4. **Ambiguity**: Requirements unclear or contradictory
5. **Resource cost**: Would incur API costs, paid services, or significant compute
6. **Scope creep**: Feature beyond original approved scope
7. **Testing gap**: Missing tests for critical path
8. **Security concern**: Potential vulnerability identified

---

## ✅ APPROVAL CHECKLISTS

### **Phase 0 → Phase 1:**

- [ ] Schemas are complete and cover all use cases
- [ ] Architecture follows clean layers
- [ ] Technology choices are justified with alternatives considered
- [ ] API contracts are clearly defined
- [ ] Testing strategy is documented
- [ ] All questions from the agent are answered

### **Phase 1 → Phase 2:**

- [ ] Monorepo builds successfully (`npm run build`)
- [ ] Tests run and pass (`npm test`)
- [ ] Development environment works (`npm run dev`)
- [ ] Shared packages are properly set up and importable
- [ ] Single source of truth is established (all types from `shared/`)
- [ ] Example integration between layers works
- [ ] Run validation: `python execution/validate_structure.py`
- [ ] Install from root: `npm install` (creates ONLY root node_modules)
- [ ] Test workspace: `npm run test --workspace=web`
- [ ] Build workspace: `npm run build --workspace=web`

### **Phase 2 → Phase 3:**

- [ ] Data layer works correctly (CRUD operations tested)
- [ ] Core services are fully tested (>80% coverage)
- [ ] No schema violations (all imports from `shared/`)
- [ ] Error handling is complete for all core flows
- [ ] State management handles all edge cases

### **Phase 3 → Phase 4:**

- [ ] All features work end-to-end
- [ ] Frontend-backend integration is complete and tested
- [ ] UI is functional, responsive, and accessible
- [ ] Security basics are implemented (auth, input validation, headers)
- [ ] Performance is acceptable (no obvious bottlenecks)

### **Phase 4 → DEPLOYMENT:**

- [ ] All tests pass in CI environment
- [ ] Build is optimized for production
- [ ] Documentation is complete and accurate
- [ ] Deployment configuration is tested
- [ ] Security audit checklist is completed

---

## 📊 SUCCESS METRICS

### **Code Quality:**

- [ ] Zero lint errors and warnings
- [ ] 80%+ test coverage on critical paths
- [ ] All tests pass in isolation and together
- [ ] Build succeeds in clean environment
- [ ] No TypeScript/compilation errors

### **Architecture Compliance:**

- [ ] Clean architecture layers respected (dependencies inward only)
- [ ] Single source of truth maintained (all types from `shared/`)
- [ ] Schemas remain consistent across codebase
- [ ] No circular dependencies
- [ ] Repository/Adapter patterns properly implemented

### **User Experience:**

- [ ] Application works end-to-end without errors
- [ ] Error messages are helpful and actionable
- [ ] Performance metrics meet requirements (load times, responsiveness)
- [ ] UI is usable on target devices/browsers
- [ ] Accessibility standards met (WCAG AA minimum)

### **Operational Readiness:**

- [ ] Deployment process documented and tested
- [ ] Monitoring/observability configured
- [ ] Backup/restore procedures defined
- [ ] Rollback plan exists
- [ ] Scalability considerations addressed

---

## 🔍 VERIFICATION COMMANDS

At each phase completion, these commands must work:

**Phase 1 Verification:**

```bash
npm install
npm run build
npm test
npm run dev  # Should start dev servers
```

**Phase 2 Verification:**

```bash
npm run test:integration  # Integration tests
npm run type-check       # Full type verification
npm run lint            # No errors
```

**Phase 3 Verification:**

```bash
npm run test:e2e        # End-to-end tests
npm run build:prod      # Production build
npm run audit           # Security audit
```

**Phase 4 Verification:**

```bash
npm run deploy:dry-run  # Deployment simulation
npm run perf            # Performance tests
npm run docs:build      # Documentation build
```

---

## 🎯 FINAL REMINDER

This is **NOT** a suggestion. This is **LAW**.

The agent is an **executor**, not a designer (after Phase 0).
The agent is an **implementer**, not an architect (after Phase 0).
The agent is a **craftsman**, not an artist (always).

**Build what was designed.**
**Follow the plan.**
**Ask when stuck.**

No heroics. No improvisation. No "better ideas" unless approved through change request process.

When in doubt: **STOP and ASK**.

---

_Document version: 3.0 - Enhanced with Single Source of Truth, Better Testing, Clearer Verification_
_Compatible with AGENTS.md governance system_
_Designed for production applications with AI assistance_
