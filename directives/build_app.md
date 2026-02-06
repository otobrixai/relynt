# Directive: Build Full-Stack Application

## Goal
Build a production-ready full-stack application following `skills.md`.

## Inputs
- Application description (from user)
- Architecture constraints from `skills.md`

## Outputs
- Version-controlled source code
- Shared schemas
- Tests
- Documentation

## Constraints
- Follow phase gates
- Obey schema & architecture freeze
- No hallucinated outputs
- No skipped steps

## Process
1. Read `skills.md`
2. Enter ARCHITECT MODE
3. Execute Phase 0
4. STOP and wait for approval
5. Proceed phase-by-phase only after approval

## Edge Cases
- If requirements are unclear → STOP
- If schema must change after freeze → Change Request
- If boundary violation is required → STOP

## Success Criteria
- Code compiles
- Tests are runnable
- Architecture remains coherent
