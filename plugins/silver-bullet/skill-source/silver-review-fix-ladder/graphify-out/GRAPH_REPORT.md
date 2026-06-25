# Graph Report - silver-review-fix-ladder  (2026-06-23)

## Corpus Check
- 1 files · ~2,085 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 22 nodes · 21 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47b66330`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `/silver:review-fix-ladder — Progressive Review / Fix Ladder` - 9 edges
2. `Step 3: Execute Ladder — State Machine (HARD)` - 9 edges
3. `Subagent Prompt Templates` - 4 edges
4. `Step 0: Resolve Scope` - 2 edges
5. `When to Use` - 1 edges
6. `Scope Lock (HARD)` - 1 edges
7. `Step 1: Derive Review Charter` - 1 edges
8. `Step 2: Resolve Ladder` - 1 edges
9. `Compliance Gate (MUST run before every rung advance)` - 1 edges
10. `No Full-Ladder Obligation` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (4 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (9): Anti-Skip Rules (MUST / FORBIDDEN), Compliance Gate (MUST run before every rung advance), Explicit States Per Rung, No Full-Ladder Obligation, Per-Rung Workflow (Orchestrator Checklist), Recovery Procedure (before resuming), Repo-wide mode (only after user confirms), Step 3: Execute Ladder — State Machine (HARD) (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (6): Host Delegation Notes, /silver:review-fix-ladder — Progressive Review / Fix Ladder, Step 1: Derive Review Charter, Step 2: Resolve Ladder, Step 4: Close Out, When to Use

### Community 2 - "Community 2"
Cohesion: 0.50
Nodes (4): Orchestrator Between Verify Passes, Subagent Prompt Templates, Template A — Audit+Fix (`rung_N_audit_fix`), Template B — Verify-Only (`rung_N_verify_1` or `rung_N_verify_2`)

## Knowledge Gaps
- **17 isolated node(s):** `When to Use`, `Scope Lock (HARD)`, `Step 1: Derive Review Charter`, `Step 2: Resolve Ladder`, `Compliance Gate (MUST run before every rung advance)` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `/silver:review-fix-ladder — Progressive Review / Fix Ladder` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.795) - this node is a cross-community bridge._
- **Why does `Step 3: Execute Ladder — State Machine (HARD)` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.629) - this node is a cross-community bridge._
- **Why does `Subagent Prompt Templates` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.271) - this node is a cross-community bridge._
- **What connects `When to Use`, `Scope Lock (HARD)`, `Step 1: Derive Review Charter` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._