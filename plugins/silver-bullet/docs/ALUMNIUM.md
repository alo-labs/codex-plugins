# Alumnium — SB Recommended Tool

Silver Bullet integrates [Alumnium](https://alumnium.ai/) ([alumnium-hq/alumnium](https://github.com/alumnium-hq/alumnium)) as an opt-in recommended tool for **browser and visual testing** — natural-language `do` / `check` / `get` / `wait` against web and mobile apps via MCP.

Alumnium is **not** token compression. It complements Graphify (retrieval), agentmemory (capture), RTK (shell output), and Context Mode (MCP compaction). See `silver-bullet.md` §8.1 for skill routing and fallback hierarchy.

## Opt-In Policy

```json
"recommended_tools": {
  "alumnium": {
    "enabled_by_user": null,
    "enforcement_suspended": false,
    "install_status": null,
    "required_when_enabled": true
  }
}
```

| `enabled_by_user` | Behavior |
|-------------------|----------|
| `null` | Consent pending — no hook enforcement |
| `true` | Hooks verify npm package reachability and MCP wiring |
| `false` | Advisory only — host browser MCP fallback per §8.1 |

Core workflows do **not** hard-block when Alumnium is absent; when opted in, hooks verify MCP is wired before substantive edits.

## Prerequisites

- Node.js 18+ and `npm` / `npx`
- Provider API key (e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or per [Alumnium docs](https://alumnium.ai/docs))

## Install

### Global package (optional)

```bash
npm install -g alumnium
```

### MCP server

**Claude Code:**

```bash
claude mcp add alumnium --env OPENAI_API_KEY="$OPENAI_API_KEY" -- npx -y alumnium mcp
```

**Cursor** — merge into `$HOME/.codex/mcp.json`:

```json
{
  "mcpServers": {
    "alumnium": {
      "command": "npx",
      "args": ["-y", "alumnium", "mcp"],
      "env": {
        "OPENAI_API_KEY": "<your-key>"
      }
    }
  }
}
```

**Codex** — merge into `~/.codex/config.toml`:

```toml
[mcp_servers.alumnium]
command = "npx"
args = ["-y", "alumnium", "mcp"]

[mcp_servers.alumnium.env]
OPENAI_API_KEY = "<your-key>"
```

Restart the agent after MCP changes.

## MiniMax M3 (OpenAI-compatible)

Alumnium v0.21.0 routes OpenAI-compatible providers via `OPENAI_CUSTOM_URL` — **not** `OPENAI_BASE_URL`.

| Setting | Value |
|---------|-------|
| Base URL (global) | `https://api.minimax.io/v1` |
| Base URL (China) | `https://api.minimaxi.com/v1` |
| Model | `MiniMax-M3` |
| `ALUMNIUM_MODEL` | `openai/MiniMax-M3` |

**Cursor** — merge into `$HOME/.codex/mcp.json` (redact your key; never commit real keys):

```json
{
  "mcpServers": {
    "alumnium": {
      "command": "npx",
      "args": ["-y", "alumnium", "mcp"],
      "env": {
        "OPENAI_CUSTOM_URL": "https://api.minimax.io/v1",
        "OPENAI_API_KEY": "sk-cp-...pCmA",
        "ALUMNIUM_MODEL": "openai/MiniMax-M3"
      }
    }
  }
}
```

**Codex** — merge into `~/.codex/config.toml`:

```toml
[mcp_servers.alumnium]
command = "npx"
args = ["-y", "alumnium", "mcp"]

[mcp_servers.alumnium.env]
OPENAI_CUSTOM_URL = "https://api.minimax.io/v1"
OPENAI_API_KEY = "<your-key>"
ALUMNIUM_MODEL = "openai/MiniMax-M3"
```

### Verified behavior (v0.21.0)

- Auth against MiniMax OpenAI-compatible API returns HTTP 200.
- Alumnium `start` works with this configuration.
- `check` / `do` with vision require the **MiniMax compatibility proxy** below — MiniMax returns `"parsed": true` (boolean) in API payloads; Alumnium v0.21.0's LangChain layer expects `parsed` to be a record or absent (`LchainSchema.MessageDataAdditionalKwargs`, `alumnium` `src/llm/LchainSchema.ts` ~line 334).

### MiniMax vision fix (SB proxy + shim)

Silver Bullet ships a local OpenAI-compatible proxy that rewrites boolean `parsed` fields before LangChain/Alumnium consume responses, plus an optional preload shim for cached generations.

| Artifact | Purpose |
|----------|---------|
| [`scripts/alumnium-minimax-proxy.mjs`](../scripts/alumnium-minimax-proxy.mjs) | HTTP proxy: `http://127.0.0.1:8787/v1` → `https://api.minimax.io/v1` |
| [`scripts/start-alumnium-minimax-proxy.sh`](../scripts/start-alumnium-minimax-proxy.sh) | Start proxy in background |
| [`scripts/patch-alumnium-minimax.mjs`](../scripts/patch-alumnium-minimax.mjs) | Patch alumnium Zod schema for boolean `parsed` (post-`npm install`) |

**Setup:**

```bash
# 1. ~/.config/alumnium/env (keep API key here only)
export OPENAI_API_KEY='<your-minimax-key>'
export OPENAI_CUSTOM_URL='http://127.0.0.1:8787/v1'
export ALUMNIUM_MODEL='openai/MiniMax-M3'

# 2. Start proxy (or let Sidekick .visual-audit script start it)
bash scripts/start-alumnium-minimax-proxy.sh

# 3. After npm install alumnium — patch bundled schema (Sidekick script runs this automatically)
node scripts/patch-alumnium-minimax.mjs path/to/node_modules/alumnium/src/client/index.js
```

**Cursor MCP** — point `OPENAI_CUSTOM_URL` at the proxy and run the proxy before starting Cursor:

```json
"env": {
  "OPENAI_CUSTOM_URL": "http://127.0.0.1:8787/v1",
  "OPENAI_API_KEY": "<your-key>",
  "ALUMNIUM_MODEL": "openai/MiniMax-M3"
}
```

**Verify:**

```bash
bash tests/scripts/test-alumnium-minimax-proxy.sh
# Sidekick pixel pass with vision checks:
ALUMNIUM_CHECKS=1 bash .visual-audit/run-alumnium-pixel-pass.sh
```

Upstream: [alumnium-hq/alumnium](https://github.com/alumnium-hq/alumnium) — consider widening `parsed` Zod to accept boolean and coerce.

## SB Skill Integration

| Skill | Alumnium use |
|-------|----------------|
| `silver:clarify` | Visual mockups, browser exploration |
| `silver:ui-review` | Layout/assertion evidence via `check` / `get` |
| `silver:verify` | Runnable-app UAT evidence |

Fallback: host browser MCP → text-only (see `silver-bullet.md` §8.1).

## Verification

```bash
SILVER_BULLET_RUNTIME=cursor bash scripts/enable-alumnium.sh
```

Manual: confirm `alumnium` appears in host MCP config and `npx -y alumnium mcp` starts without error.
