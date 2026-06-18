---
tags: [api]
summary: api implementation decisions and patterns
relevantTo: [api]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# api

### Created separate `submitPreConsultation()` endpoint rather than treating submission as just a status update (2026-06-18)
- **Context:** Pre-consultation has two distinct states: DRAFT (editable, auto-saved) and SUBMITTED (immutable, finalized)
- **Why:** Submission is a state transition with side effects (compute flags, lock data). Explicit endpoint prevents accidental overwrites via generic update. RLS policies enforce immutability post-submission. Clearer intent in code: update = auto-save during editing, submit = finalize after completion.
- **Rejected:** Generic updatePreConsultation with status parameter would allow bypassing business rules. No clear semantic boundary between auto-save and finalization.
- **Trade-offs:** More API surface area but clearer contracts. Prevents logic errors where doctor accidentally overwrites submitted data.
- **Breaking if changed:** If submit endpoint is bypassed for generic updates, data immutability is lost and flags may be computed incorrectly (timing issues).

#### [Pattern] Created idempotent `createPreConsultation()` that returns existing draft if already created for appointment (2026-06-18)
- **Problem solved:** Patient may click 'fill form' button multiple times. Appointment can have at most one pre-consultation.
- **Why this works:** Prevents duplicate records. If user refreshes page or double-clicks, they get back to their existing draft. Idempotency is REST best practice. Simplifies frontend state management (no need to check if record exists first).
- **Trade-offs:** Database query cost (check exists before insert), but prevents cascading issues.