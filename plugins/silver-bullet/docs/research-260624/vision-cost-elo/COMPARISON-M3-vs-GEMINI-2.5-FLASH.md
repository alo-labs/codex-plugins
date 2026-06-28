# MiniMax M3 (MiniMax.io Plus $20/mo) vs Gemini 2.5 Flash (Cursor)

**Vision task:** 1280×800 web app screenshot → 1280 image tokens + 50 prompt tokens + 300 output tokens (same definition as the parent Pareto analysis)

## Pricing sources

| Source | Input $/M | Output $/M | Notes |
|---|---:|---:|---|
| MiniMax M3 — `minimax-coding-plan` provider in models.dev | **$0.00** | **$0.00** | Covered by Token Plan subscription quota |
| MiniMax M3 — pay-as-you-go `minimax` / `vercel/minimax` API rate | **$0.30** | **$1.20** | Used after Token Plan quota is exhausted |
| Gemini 2.5 Flash — Cursor API pool (Cursor page lists it at the Google API rate) | **$0.30** | **$2.50** | Cursor Pro plan includes $20 of API credit |

## Per-task cost

```
cost = (image + text) × input_per_M / 1,000,000  +  output × output_per_M / 1,000,000
     = 1330 × input/1e6 + 300 × output/1e6
```

| Path | Input | Output | Total / task |
|---|---:|---:|---:|
| **MiniMax M3** at pay-as-you-go rate ($0.30 / $1.20) | $0.000399 | $0.000360 | **$0.000759** |
| **Gemini 2.5 Flash** at Cursor rate ($0.30 / $2.50) | $0.000399 | $0.000750 | **$0.001149** |

→ At the underlying API rate, **MiniMax M3 is 33.9 % cheaper per vision task** than Gemini 2.5 Flash. The difference is entirely on output tokens ($1.20 vs $2.50 per 1M); input rates are identical.

## Quality (LMArena Vision ELO, Jun 25 2026)

| Model | ELO | LMArena rank |
|---|---:|---:|
| MiniMax M3 | **1,242** | #33 |
| Gemini 2.5 Flash | 1,214 | #52 |

→ MiniMax M3 is also **+28 ELO higher** — it's both cheaper AND better on the benchmark.

## Subscription comparison at $20/month

Both vendors sell a $20/month tier aimed at the same user:

| Plan | Price | What's included | Source |
|---|---:|---|---|
| **MiniMax.io Token Plan — Plus** | $20/mo | "3-4 agents", 5-hour rolling + weekly quota windows, usage-based deduction. **Exact token quota not published.** | [platform.minimax.io/docs/token-plan/intro](https://platform.minimax.io/docs/token-plan/intro), [pricing-token-plan](https://platform.minimax.io/docs/guides/pricing-token-plan) |
| **Cursor Pro** | $20/mo | $20 of API-pool usage at underlying API rates + unlimited Auto/Composer pool + unlimited tab completions | [cursor.com/docs/models-and-pricing](https://cursor.com/docs/models-and-pricing) |

Cursor Pro gives a clean, calculable quota ($20 at API rates). MiniMax.io's Plus plan gives a "capacity" expressed in agent count and rolling time windows; the docs explicitly say "Different plans include different quotas and approximate usage capacity. See the pricing page for details" but **the pricing page does not publish a token number**. So the only honest read of the MiniMax.io plan is "fits ~3-4 concurrent agents' worth of multimodal work — actual monthly token count is whatever the rolling-window system admits."

### Tasks per $20 of API spend (cleaner comparison)

| | MiniMax M3 | Gemini 2.5 Flash |
|---|---:|---:|
| Vision tasks per $20 at pay-as-you-go rate | **26,350** | 17,406 |
| Delta | +51 % | — |

→ If both vendors gave a flat $20 of API spend, MiniMax M3 would deliver **51 % more vision tasks** than Gemini 2.5 Flash.

## Monthly cost at different usage volumes

Cost = `$20 subscription` if usage fits within quota, else `$20 + (excess × pay-as-you-go rate)`. The "$20 subscription" column assumes the Plus / Cursor Pro quota accommodates the volume (likely true for MiniMax up to ~3-4 agents × heavy usage; for Cursor it's exactly $20 of API credit).

| Volume (vision tasks / month) | MiniMax.io Plus (assumed quota fits) | Cursor Pro ($20 API credit) | M3 pure pay-as-you-go | Gemini 2.5 pure pay-as-you-go |
|---:|---:|---:|---:|---:|
| 100 | $20.00 | $20.00 | $0.08 | $0.11 |
| 1,000 | $20.00 | $20.00 | $0.76 | $1.15 |
| 5,000 | $20.00 | $20.00 | $3.79 | $5.75 |
| 10,000 | $20.00 | $20.00 | $7.59 | $11.49 |
| 50,000 | **$37.95** | **$57.45** | $37.95 | $57.45 |
| 100,000 | $75.90 | $114.90 | $75.90 | $114.90 |
| 500,000 | $379.50 | $574.50 | $379.50 | $574.50 |

The breakeven for MiniMax.io Plus ($20) is somewhere between **~26,000 tasks/month** at pay-as-you-go rates — but in practice the Plus plan's actual token quota (unpublished) decides where the subscription stops being cheaper than pay-as-you-go.

## Verdict

| Dimension | Winner | Margin |
|---|---|---|
| Per-task cost (API rate) | **MiniMax M3** | 33.9 % cheaper |
| Vision benchmark (LMArena ELO) | **MiniMax M3** | +28 ELO (+2.3 %) |
| Tasks per $20 spend | **MiniMax M3** | 51 % more tasks |
| Subscription clarity / quota transparency | **Cursor Pro** | Cursor publishes $20 of API credit; MiniMax.io publishes "3-4 agents" but not a token number |
| Cross-model flexibility | **Cursor Pro** | Cursor Pro's $20 credit works across all 41 frontier models (Claude, GPT, Gemini, Grok, GLM, Kimi); MiniMax.io Plus is locked to MiniMax models |
| Rate-limit predictability | **Cursor Pro** | No rate throttling mentioned; MiniMax.io Plus throttles at "3-4 agents" with rolling windows and may tighten during peak |

**Bottom line:** for *just* vision-task spend, **MiniMax M3 dominates** on every dimension — cheaper per task, higher ELO, and more tasks per dollar. The MiniMax.io Plus subscription makes that cheaper-by-33.9 % advantage effectively free if your usage fits inside the (unpublished) quota. But **Cursor Pro is the better platform choice** if you need more than one model, want a published quota number, or may exceed the MiniMax.io Plus tier — at which point you're back to pay-as-you-go rates where the M3 advantage still holds (33.9 %) but the rest of Cursor's model catalog becomes available at the same flat rate.