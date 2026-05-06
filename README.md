# Ālo Labs Codex Plugin Marketplace

Official marketplace for Ālo Labs Codex plugins.

## Installation

Add this marketplace to your Codex environment:

```bash
codex plugin marketplace add alo-labs/codex-plugins
```

## Packages

| Package | Description | Notes |
|---------|-------------|-------|
| Sidekick | Sidekick workflows for Codex, including Forge and Codex sidekick orchestration. | Thin wrapper over `alo-exp/sidekick`; the package is pinned to a release commit and loaded from the shared Sidekick repo. |
| Silver Bullet | Agentic process orchestrator for AI-native software engineering and DevOps. | SB-owned Codex package only. |
| Product Management | Product planning, roadmap, and research workflows for Codex. | Thin wrapper over `anthropics/knowledge-work-plugins`; upstream skills are fetched at install time. |
| Engineering | Coding workflow support for Codex. | Thin wrapper over `anthropics/knowledge-work-plugins`; upstream skills are fetched at install time. |
| Design | Design workflow support for Codex. | Thin wrapper over `anthropics/knowledge-work-plugins`; upstream skills are fetched at install time. |

## Contributing

To update the marketplace, edit `.agents/plugins/marketplace.json` and the package directories it references.
