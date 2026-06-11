# Session Notes — 2026-05-07

## Summary

- Tightened the Codex packaging boundary so the SB bundle stays SB-only.
- Moved third-party Codex compatibility wrappers to the shared `alo-labs/codex-plugins`
  marketplace and kept upstream plugin content external.
- Kept Claude packaging intact while aligning the Codex installer, sync script, and docs.
- Added dual-runtime live coverage so the same scenario suite runs against both Claude and Codex.
- Released `v0.32.0` and then documented the packaging, testing, and release changes in the
  project docs.
- Created the Codex hourly issue-triage automation and confirmed the scheduling / cost tradeoffs
  around polling versus event-driven triggers.

## Verification

- `tests/scripts/test-install-codex.sh`
- `tests/scripts/test-sync-codex-package.sh`
- `tests/live/run-live-tests.sh` for both runtimes, run sequentially
- `bash -n` on the updated shell scripts
- `git diff --check`

## Notes

- Shared runtime state means the live matrix should stay sequential when Claude and Codex are both
  exercised in one pass.
- For truly event-driven issue handling, a GitHub webhook or GitHub Action bridge is still the
  cleaner path than schedule-based polling.

## Items Filed

- #206: chore: install Graphify CLI for local SB retrieval
- #207: bug: fix Claude live matrix hang during release gate
- #208: bug: fix Kay live Stage C edit release-gate failures
