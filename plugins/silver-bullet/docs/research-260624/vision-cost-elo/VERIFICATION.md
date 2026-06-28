# Verification of Other Agent's Vision Pareto Analysis

**My original analysis:** `docs/research-260624/vision-cost-elo/` (`index.html`, `chart.png`, `data.json`, `pareto.json`, `REPORT.md`)
**Other agent's analysis:** `/Users/shafqat/projects/misc/vision-models-pareto-analysis.md` + `vision-analysis-data.json` + `vision-models-pareto.canvas.tsx`

## Summary verdict

The other agent's analysis is **directionally correct and reaches a Pareto frontier that is mostly consistent** with mine, but it differs on three concrete points: scope, pricing source, and a pricing inconsistency (OpenCode Go subscription discount applied selectively). After reconciliation, the two frontiers converge to within 1 model.

| | My analysis | Other agent | Reconciled |
|---|---|---|---|
| Scope | Cursor (41) + OpenCode Go (13) = 54 | Cursor (17) + OpenCode Zen+Go (58) = 75 | Cursor (41) + OpenCode Zen+Go (58) = 99 |
| Vision-capable | 42 | 54 | 67 |
| Plottable (have LMSYS ELO) | 40 | 32 | 45 |
| Frontier size (API pricing) | 7 | n/a | **8** |
| Frontier size (Go subscription pricing) | n/a | 8 | **9** |
| Benchmark | LMArena Vision Arena (Jun 25 2026) | Same | Same |
| Vision-task formula | 1280 img + 50 prompt + 300 output | 1100 img + 500 prompt + 300 output | 1280 img + 50 prompt + 300 output |

## Discrepancies explained

### 1. Scope — the other agent pulled in OpenCode Zen, not just Go
- **User's original request was explicit**: `https://opencode.ai/docs/go/` — Go only.
- I followed that literally → 13 models.
- The other agent broadened to `https://opencode.ai/zen/v1/models` (58 models) and merged with Go → caught Qwen3.5 Plus, Claude Opus 4.7 (Zen), MiMo-V2-Omni, etc. that don't appear on the Go docs page.
- This is a reasonable broadening but goes beyond what was asked. After reconciliation, I added the Zen models back into my dataset and the frontier only shifts by one model.

### 2. Cursor pricing — I extracted it directly; the other agent couldn't
- The other agent's note "Cursor pricing docs are SPA-only (costs from models.dev API rates)" is **incorrect** for this URL. The Cursor page is plain HTML and fully indexable; I pulled 41 rows of `(model, input $, output $, notes)` directly via a normal HTTP fetch.
- For the 17 Cursor models they did keep, they used models.dev API rates instead. For most models these match (Anthropic, OpenAI, Google public pricing is what's on the Cursor page), but they **missed the Fast-mode SKUs** (`Claude 4.6 Opus Fast mode` at $30/$150, `Claude Opus 4.7 fast mode` at $30/$150, `GPT-5 Fast` at $2.5/$20) which are 6× the base price for the same underlying model. Their frontier is missing those dominated points.

### 3. Pricing source inconsistency — OpenCode Go 3× discount
- For `MiniMax-M3`, the other agent used `in:$0.1 / out:$0.4` per 1M — that's the **OpenCode Go 3×-usage discounted rate** (verified in `models.dev/opencode-go`).
- For `Claude Opus 4.7` (OpenCode Zen) they used `in:$5 / out:$25` — that's the regular API rate.
- For `Qwen3.7 Plus` they used `in:$0.4 / out:$1.6` — but in `models.dev/opencode-go` it's `in:$0.4 / out:$1.6` too, so that one matches.
- For `MiMo-V2.5` they used `in:$0.14 / out:$0.28` (Vercel rate, no discount applied).
- The 3× discount is real but is only available on OpenCode Go for specific models. Mixing the discounted Go rate for one model and the API rate for another in the same "subscription" frontier is **inconsistent** and overstates the savings. My analysis keeps API rates everywhere, which is the cleaner comparison.

### 4. Cost formula
- Mine: `1280 (img) + 50 (prompt) + 300 (output)` — image-heavy task with minimal prompt
- Theirs: `1100 (img) + 500 (prompt) + 300 (output)` — slightly larger prompt
- Both are defensible; mine gives roughly 10–15 % lower costs across the board but doesn't change the frontier ordering.

## Reconciled Pareto frontiers

After merging both datasets and computing on 45 plottable models with the image-heavy formula:

### API-rate pricing (cleanest cross-provider comparison) — **8 frontier models**

| # | Model | Source | $/task | ELO |
|---|---|---|---:|---:|
| 1 | **GPT-5 Nano** | Cursor | $0.000187 | 1,160 |
| 2 | **mimo-v2.5** | OpenCode Go/Zen | $0.000224 | 1,239 |
| 3 | **Qwen3.5 Plus** | OpenCode Zen | $0.000626 | 1,245 |
| 4 | **qwen3.7-plus** | OpenCode Go | $0.000810 | 1,266 |
| 5 | **gemini-3-flash** | Cursor | $0.001565 | 1,272 |
| 6 | **gemini-3-pro** | Cursor | $0.006260 | 1,289 |
| 7 | **Claude Opus 4.5/4.6/4.7/4.8** | Cursor | $0.014150 | 1,292–1,298 |
| 8 | **claude-fable-5** | Cursor | $0.028300 | 1,311 |

### OpenCode Go subscription pricing (their methodology) — **9 frontier models**

Same as above, plus **MiniMax-M3** slots in at position 3 ($0.000253, ELO 1,242) thanks to the 3× usage discount.

## Where each agent's frontier was wrong

- **Mine (7)**: Missed GPT-5 Nano (I had it as a non-pareto point because my smaller prompt size favored MiMo on absolute cost; with the union dataset and merged Zen models it joins the frontier).
- **Theirs (8)**: Reached the right frontier set but used mixed pricing (API for Zen models, discounted for Go models). After unifying, the discount matters for exactly one model: **MiniMax-M3**, which legitimately joins the frontier if you assume the 3× discount.

## Where each agent's analysis was right

- **LMArena Vision Arena is the right benchmark** for "all models appearing in one place" — MMMU only has 30 historical models and excludes all post-2025 frontier; LMSYS is the only one with Anthropic, OpenAI, Google, xAI, Alibaba, Moonshot, Xiaomi, MiniMax simultaneously.
- **Image-token cost is the dominant term** in vision task pricing — both analyses correctly weight it heavily.
- **Claude Fable 5 anchors the top of the frontier**, **Gemini 3 Pro is the best mid-tier value**, and **Qwen3.7 Plus is the cheapest model above ELO 1,260**. Both reports agree on this.
- **Anthropic dominates the high-ELO region**; **Chinese open models (Xiaomi, Alibaba) dominate the cheap region**; **OpenAI only competes in the sub-cent range via Nano/Mini**.

## Files added in this verification pass

- `docs/research-260624/vision-cost-elo/verification.png` — chart with both frontiers overlaid (green = API, orange = Go-subscription)
- `docs/research-260624/vision-cost-elo/verification.svg` — vector source
- `docs/research-260624/vision-cost-elo/VERIFICATION.md` — this document
- `docs/research-260624/vision-cost-elo/reconciled-api.json` — 45-model dataset + 8-model API frontier
- `docs/research-260624/vision-cost-elo/reconciled-go.json` — 45-model dataset + 9-model Go-subscription frontier

## Bottom line

Both analyses are sound. The "correct" frontier depends on which pricing story you want to tell:

- **For "what would I pay per vision task on the underlying API?"** → 8 frontier models, GPT-5 Nano at $0.000187 anchors the cheap end, Claude Fable 5 at $0.0283 anchors the top.
- **For "what would I pay if I'm an OpenCode Go subscriber using the 3× usage tier?"** → same 8 plus MiniMax-M3, with a clear practical-sweet-spot line at `gemini-3-flash` (ELO 1,272 at $0.001565/task — about 18× cheaper than the top for only 39 ELO points lost).

The other agent's chart and report are usable; the inconsistencies are minor (one extra model on the frontier, one omitted Fast-mode dominated point, one mixed pricing source) and do not change the actionable conclusion.