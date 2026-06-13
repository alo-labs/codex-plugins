#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST_DIR="${REPO_ROOT}/plugins/silver-bullet"
AGENT_RENDERER="${SCRIPT_DIR}/render-agent-bundle.py"

log() {
  printf '[cursor-sync] %s\n' "$*"
}

mkdir -p "$DEST_DIR/.codex-plugin"

if [[ ! -f "$DEST_DIR/.codex-plugin/plugin.json" ]]; then
  printf 'ERROR: missing Cursor manifest at %s\n' "$DEST_DIR/.codex-plugin/plugin.json" >&2
  exit 1
fi

log "Refreshing generated Cursor package surface in ${DEST_DIR}"

mkdir -p "${REPO_ROOT}/agents"
python3 "$AGENT_RENDERER" render --agent cursor --source-root "${REPO_ROOT}/skills" --dest-root "${REPO_ROOT}/agents/cursor"

shopt -s dotglob nullglob
for entry in "${DEST_DIR}"/*; do
  base="$(basename "$entry")"
  if [[ "$base" == ".codex-plugin" || "$base" == ".codex-plugin" ]]; then
    continue
  fi
  rm -rf -- "$entry"
done
shopt -u dotglob nullglob

PACKAGE_ENTRIES=(
  scripts
  templates
)

for entry in "${PACKAGE_ENTRIES[@]}"; do
  if [[ ! -e "${REPO_ROOT}/${entry}" && ! -L "${REPO_ROOT}/${entry}" ]]; then
    printf 'ERROR: package source missing: %s\n' "${entry}" >&2
    exit 1
  fi
  ln -sfn "../../${entry}" "${DEST_DIR}/${entry}"
done

rm -rf -- "${DEST_DIR}/hooks"
mkdir -p -- "${DEST_DIR}/hooks"
rsync -a --delete "${REPO_ROOT}/hooks/" "${DEST_DIR}/hooks/"

if [[ -d "${REPO_ROOT}/templates" ]]; then
  rm -rf -- "${DEST_DIR}/templates"
  mkdir -p -- "${DEST_DIR}/templates"
  rsync -a --delete "${REPO_ROOT}/templates/" "${DEST_DIR}/templates/"
fi

rm -rf -- "${DEST_DIR}/agents"
mkdir -p -- "${DEST_DIR}/agents"
rsync -a --delete "${REPO_ROOT}/agents/cursor/" "${DEST_DIR}/agents/cursor/"

python3 "${REPO_ROOT}/hooks/generate-cursor-hooks.py"
install -d -m 755 "${DEST_DIR}/hooks"
install -m 644 "${REPO_ROOT}/hooks/cursor-hooks.json" "${DEST_DIR}/hooks/cursor-hooks.json"

plugin_version="$(jq -r '.version' "${REPO_ROOT}/package.json")"
tmp="$(mktemp)"
jq --arg v "$plugin_version" '.version = $v' "$DEST_DIR/.codex-plugin/plugin.json" > "$tmp"
mv "$tmp" "$DEST_DIR/.codex-plugin/plugin.json"

log "Cursor package synchronized"
