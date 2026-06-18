---
tags: [security]
summary: security implementation decisions and patterns
relevantTo: [security]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# security

### Stored entire medical history (medications, allergies, conditions) as JSONB arrays rather than normalized tables (2026-06-18)
- **Context:** Pre-consultation has variable-length lists (multiple medications, multiple allergies). Options: normalize into separate tables or store as JSON.
- **Why:** Pre-consultation is a single logical snapshot taken at appointment time. Normalizing would require junction tables + migrations complexity. JSONB allows easy versioning (entire snapshot immutable). Simpler RLS (one table, not 5). Doctor queries one row, not joins. Medical data integrity: snapshot taken at specific time is preserved exactly.
- **Rejected:** Normalized design (pre_consultations + pre_consultation_medications + pre_consultation_allergies) would allow fine-grained RLS per item type, but adds complexity without benefit since entire form is locked together.
- **Trade-offs:** JSONB is less queryable (can't easily filter by 'all patients with penicillin allergy' across appointments). But pre-consultation is write-once read-in-context (doctor sees one patient's), not aggregated across patients.
- **Breaking if changed:** If normalized, migrations become complex. If JSONB constraints removed, invalid data structures could be stored (missing required fields).