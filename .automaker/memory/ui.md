---
tags: [ui]
summary: ui implementation decisions and patterns
relevantTo: [ui]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# ui

#### [Pattern] Multi-step form with debounced auto-save (2-second delay) rather than save-on-blur or explicit save button (2026-06-18)
- **Problem solved:** Patient form with 5 steps, many checkbox/text inputs. Medical forms require frequent saves but clicking save button is friction.
- **Why this works:** 2-second debounce balances: (1) user sees changes persisted quickly (feels responsive), (2) not hammering backend on every keystroke, (3) network lag doesn't block UX. Auto-save reduces anxiety about data loss. Medical forms need implicit trust.
- **Trade-offs:** Auto-save requires optimistic UI + rollback on error. Debounce hides some save operations (user may not see confirmation). But patient perception is better.

#### [Gotcha] Check-in button disabled when hasProfile is false/null - but null means 'loading'. Must render different UI states for no-profile vs loading-profile. (2026-06-18)
- **Situation:** Button shows spinner while checking if patient profile exists. User sees 'Xem hồ sơ' if it exists, 'Tạo hồ sơ' if not. But during load, hasProfile is null.
- **Root cause:** Three states require three code paths: false (create button), true (view button), null (loading). If null is treated as false, button jumps between states during load (confusing UX).
- **How to avoid:** More conditional rendering but smoother UX.