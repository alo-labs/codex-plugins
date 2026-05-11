#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PLUGIN_ROOT="$REPO_ROOT/plugins/silver-bullet"
MANIFEST="$PLUGIN_ROOT/.codex-plugin/plugin.json"
MARKETPLACE="$REPO_ROOT/.agents/plugins/marketplace.json"

assert_file() {
  local label="$1"
  local path="$2"
  if [[ -f "$path" ]]; then
    echo "PASS: $label"
  else
    echo "FAIL: $label -- missing: $path" >&2
    return 1
  fi
}

assert_jq() {
  local expr="$1"
  local path="$2"
  if jq -e "$expr" "$path" >/dev/null; then
    echo "PASS: $expr"
  else
    echo "FAIL: $expr in $path" >&2
    return 1
  fi
}

assert_file "Silver command plugin manifest" "$MANIFEST"
assert_jq '.name == "silver-bullet"' "$MANIFEST"
assert_jq '.commands == "./commands/"' "$MANIFEST"
assert_jq '.plugins[] | select(.name == "silver-bullet") | .source.path == "./plugins/silver-bullet"' "$MARKETPLACE"

COMMANDS=(
  add
  blast-radius
  bugfix
  create-release
  devops
  fast
  feature
  forensics
  ingest
  init
  migrate
  quality-gates
  release
  rem
  remove
  research
  review-stats
  scan
  ensure-docs
  spec
  ui
  update
  validate
)

for command in "${COMMANDS[@]}"; do
  assert_file "Silver slash command $command" "$PLUGIN_ROOT/commands/${command}.md"
done

echo "PASS: silver command packaging surface is complete"
