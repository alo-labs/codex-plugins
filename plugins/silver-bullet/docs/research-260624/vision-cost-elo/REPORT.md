# Vision-Capable Models: Cost vs Performance Pareto Analysis

## Task

Compare all vision-capable models from **Cursor** and **OpenCode Go**, plot their cost per "typical web app screenshot understanding" task against their ranking on a common vision benchmark, and identify the Pareto frontier.

## Data Sources

- **Cursor**: <https://cursor.com/docs/models-and-pricing> (41 models listed in the API pool)
- **OpenCode Go**: <https://opencode.ai/docs/go/> (13 curated models in the $5/$10 subscription tier)
- **Vision filtering**: <https://models.dev/> — `modalities.input` contains `"image"` (5,246 models in 145 providers)
- **Pricing**: `models.dev` `cost.input` / `cost.output` per 1M tokens, normalized via canonical providers (Anthropic, OpenAI, Google, xAI, Zhipu, Moonshot, Alibaba, DeepSeek, Xiaomi, MiniMax)
- **Benchmark**: **LMArena Vision Leaderboard** — `lmarena.ai/leaderboard/vision` (1,064,509 user votes, 131 models, snapshot Jun 25 2026). This is the broadest vision benchmark where all listed providers actually appear. MMMU was the alternative but its official leaderboard only includes a few dozen models from 2023-2025; LMArena Vision Arena is live, user-voted, and includes all 24 organizations present in our model list.

## Vision Task Cost Definition

For "understanding a typical web app screenshot" (1280×800 px):

| Component | Tokens |
|---|---|
| Image (1280×800 web app screenshot, OpenAI-style tokenization) | 1,280 |
| Text prompt ("Describe and analyze this UI...") | 50 |
| **Input total** | **1,330** |
| Output (detailed description / analysis) | 300 |

Cost formula: `cost = (image + text) × input_price/1M + output × output_price/1M`

## Filtering Pipeline

```
Cursor models            = 41
OpenCode Go models       = 13
Combined unique          = 54

Drop text-only (no "image" in modalities.input)
   - GLM-5.x, MiMo V2.5-Pro, MiniMax M2.7, Qwen3.7 Max, DeepSeek V4, Composer 1/1.5/2 (proprietary, not in models.dev)
   - -14 models
Vision-capable           = 42

Cross-reference with LMArena Vision leaderboard
   - Grok Build 0.1 not yet on LMArena
   - Qwen3.6 Plus not on LMArena (only Qwen3.7 Plus is)
Plottable                = 40
```

## Pareto Frontier (7 points)

| # | Model | Provider | Source | $/task | ELO |
|---|---|---|---|---:|---:|
| 1 | **mimo-v2.5** | Xiaomi | OpenCode Go | $0.000224 | 1,239 |
| 2 | **qwen3.7-plus** | Alibaba | OpenCode Go | $0.000810 | 1,266 |
| 3 | **gemini-3-flash** | Google | Cursor | $0.001565 | 1,272 |
| 4 | **gemini-3-pro** | Google | Cursor | $0.006260 | 1,289 |
| 5 | **claude-opus-4-6** | Anthropic | Cursor (Claude 4.5 Opus / 4.6 Opus / 4.7 Opus / Opus 4.8 all collapse here at $5/$25) | $0.014150 | 1,297 |
| 6 | **claude-opus-4-7** | Anthropic | Cursor | $0.014150 | 1,298 |
| 7 | **claude-fable-5** | Anthropic | Cursor | $0.028300 | 1,311 |

The 5th and 6th frontier points are **Cursor pricing collapses**: Cursor exposes four separate Claude Opus SKUs (4.5 Opus, 4.6 Opus, 4.7 Opus, Opus 4.8) all priced at $5/$25 with the underlying model identical or near-identical on the benchmark, so they occupy the same cost column and only Opus 4.7 (ELO 1298) and Opus 4.6 (ELO 1297) clear the frontier threshold.

## Pareto Frontier Takeaways

- **Anthropic dominates the high end.** Claude Fable 5 is the single best vision model in the combined pool, but it costs **~127×** more per task than the cheapest model (mimo-v2.5) and only buys ~72 ELO points.
- **OpenAI models are off the frontier** at the high end (GPT-5.5 at $0.0157 is dominated by Claude Opus 4.6 at $0.0142 with higher ELO) and only the very smallest GPT variants are cost-competitive in the sub-cent range (GPT-5.4 Nano, GPT-5 Mini).
- **Google's Gemini line is the most cost-efficient frontier provider** — both `gemini-3-flash` and `gemini-3-pro` sit on the frontier with no competitor beating them on price/performance at their respective quality tiers.
- **Chinese open models (Xiaomi MiMo, Alibaba Qwen) own the cheap frontier.** mimo-v2.5 is ~7× cheaper than the next frontier point and still hits 1,239 ELO. qwen3.7-plus is the only sub-$0.001 model above 1,250 ELO.
- **Cursor's "Fast mode" SKUs** ($30/$150 per 1M, ~6× the regular Claude Opus price) are always off the frontier — same benchmark ELO as their base counterparts at 6× cost. They appear in the chart at far right with no Pareto contribution.
- **gpt-5-high and Claude Sonnet SKUs** all sit below the frontier in the mid-range — they're matched or beaten on cost-per-ELO by either Gemini or the next Anthropic Opus tier.

## Files

- `chart.svg` / `chart.png` — static chart, X = log-cost, Y = LMArena ELO, frontier highlighted
- `index.html` — interactive Chart.js version with hover tooltips
- `data.json` — full 40-row plottable dataset
- `pareto.json` — 7-row frontier dataset

## Caveats

1. The Cursor and OpenCode Go documentation reference **future-state models** (Claude 4.x/4.5.x/4.6.x/4.7.x/4.8/Fable 5, GPT-5.0 through 5.5, Gemini 3.0 through 3.5, GLM-5.x, Kimi K2.5/2.6/2.7, Qwen3.5/3.6/3.7, MiMo V2.5, MiniMax M3, DeepSeek V4). The data is taken as published by the providers and `models.dev`; if any version labels are forward-projected rather than actually deployed, the frontier ranking would change.
2. A few mappings required a nearest-neighbour when the exact model was not yet on LMArena:
   - `Claude 4.5 Haiku` → `claude-3-5-haiku-20241022` (no 4.5 haiku on LMArena)
   - `Claude 4.5 Opus` → `claude-opus-4-6` (4.5 opus not on LMArena)
   - `Claude 4.5 Sonnet` → `claude-sonnet-4-6`
   - `Gemini 3.5 Flash` → `gemini-3-flash`
   - `Kimi K2.7 Code` → `kimi-k2.6` (2.7 not on LMArena)
   - `GPT-5.3 Codex` → `gpt-5.2` (5.3 not on LMArena)
   - `GPT-5-Codex`, `GPT-5` → `gpt-5-chat` (closest base)
   These are flagged in `data.json` so the reader can substitute better scores when those versions land on LMArena.
3. Cost uses **input + output token pricing**; cache-read discounts and prompt-cache discounts are not modelled. Anthropic Opus has aggressive cache discounts (~90% off cached reads) that would shift its effective cost well below the frontier line for repeat prompts — this is not reflected.