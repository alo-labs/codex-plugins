# Ālo Labs Codex Plugin Marketplace (deprecated)

**This repository has moved.** Use the unified marketplace instead:

**https://github.com/alo-labs/agent-plugins**

## Migration

```bash
codex plugin marketplace add alo-labs/agent-plugins --sparse .agents/plugins
codex plugin add silver-bullet@alo-labs-codex
```

Or from a Silver Bullet checkout:

```bash
bash scripts/install-codex.sh --public-release --purge-legacy-skills
```

The marketplace ID remains `alo-labs-codex`; only the source repository changed.
