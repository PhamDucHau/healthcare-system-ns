---
tags: [database]
summary: database implementation decisions and patterns
relevantTo: [database]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# database

### Used computed `flags` field (drug_allergy, severe_pain) stored in database rather than computed on-the-fly in application (2026-06-18)
- **Context:** Need to highlight critical warnings for doctors when reviewing pre-consultation data
- **Why:** Computed flags at database level via RPC function ensures consistency across all consumers (API, realtime subscriptions, reports). Doctors need instant visual warnings - querying flags at write-time is atomic. Avoids denormalization complexity in application logic.
- **Rejected:** Computing flags in application layer would require doctors to re-query/re-compute on each view, risking stale state. Client-side computation would miss server-side API consumers.
- **Trade-offs:** Added database logic complexity but gained query performance (no post-processing) and guaranteed correctness. Extra storage minimal (2 boolean columns).
- **Breaking if changed:** If flags are removed, warning system for doctors becomes unreliable. Doctors may miss critical allergies/pain levels during consultation.

#### [Gotcha] RLS policy must allow INSERT for patients with NULL pre_consultation record, but prevent UPDATES after SUBMITTED (2026-06-18)
- **Situation:** First appointment visit: patient has no pre_consultation record. Must create first record (idempotent). Later: doctor views locked data. Cannot use simple 'user_id = auth.uid()' check.
- **Root cause:** Two distinct operations need different permissions: initial creation (INSERT, anyone) vs modification (UPDATE, only if DRAFT). Implemented via RPC that checks status before allowing update. Without explicit status check, UPDATE policy alone is insufficient.
- **How to avoid:** RPC adds indirection but provides atomic operation. Alternative (policy with status check) is hard to debug and maintain.