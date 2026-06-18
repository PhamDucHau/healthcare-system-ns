---
tags: [architecture]
summary: architecture implementation decisions and patterns
relevantTo: [architecture]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# architecture

#### [Pattern] Two-path UI pattern: Patient completes PreConsultationForm, doctors view PreConsultationView (read-only with banners) (2026-06-18)
- **Problem solved:** Same data consumed by two personas with different needs - patient needs edit capability, doctor needs warnings
- **Why this works:** Separation of concerns. Patient form handles all validation/submission logic. Doctor view is stateless read-only component focused on visual warnings. Prevents accidental mutation bugs where doctors modify locked data.
- **Trade-offs:** Code duplication in displaying same fields, but each component is simpler and focused. Forms are user-facing so clarity over DRY is worth it.

### Computed pain_scale as integer 1-10 slider rather than categorical pain descriptors (none/mild/moderate/severe) (2026-06-18)
- **Context:** VAS (Visual Analog Scale) vs categorical pain assessment. Medical standard is VAS for acute pain.
- **Why:** Numeric scale is clinically standard for acute pain (better for trending and severity protocols). Slider UX is intuitive (visual feedback). Flag on pain >= 7 gives clear clinical threshold. Integer storage is unambiguous (no translation issues).
- **Rejected:** Categorical ('moderate pain') is more conversational but loses precision. Would need mapping to numeric for clinical protocols anyway.
- **Trade-offs:** Patients understand 0-10 scale (common in healthcare). No translation ambiguity. Easier to integrate with clinical scoring systems.
- **Breaking if changed:** If changed to categorical, flag logic (pain >= 7) breaks. Would need to redefine what severity triggers warning.