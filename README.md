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
| Silver Bullet | Agentic process orchestrator for AI-native software engineering and DevOps. | SB-owned Codex package only. |
| Product Management | Product planning, roadmap, and research workflows for Codex. | Thin wrapper over `anthropics/knowledge-work-plugins`; upstream skills are fetched at install time. |
| Engineering | Coding workflow support for Codex. | Thin wrapper over `anthropics/knowledge-work-plugins`; upstream skills are fetched at install time. |
| Design | Design workflow support for Codex. | Thin wrapper over `anthropics/knowledge-work-plugins`; upstream skills are fetched at install time. |

## Contributing

To update the marketplace, edit `.agents/plugins/marketplace.json` and the package directories it references.
