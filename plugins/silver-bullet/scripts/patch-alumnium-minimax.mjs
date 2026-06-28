#!/usr/bin/env node
/**
 * Patch alumnium@0.21.0 for MiniMax OpenAI-compatible API compatibility.
 * Idempotent — safe to run after npm install.
 */
import fs from 'node:fs';
import path from 'node:path';

const target =
  process.argv[2] ||
  path.join(process.cwd(), 'node_modules', 'alumnium', 'src', 'client', 'index.js');

if (!fs.existsSync(target)) {
  console.error(`alumnium bundle not found: ${target}`);
  process.exit(1);
}

const MARK = '/* sb-minimax-parsed-patch */';
const TOSTORED_MARK = '/* sb-minimax-tostored-patch */';

// Keep in sync with scripts/alumnium-minimax-proxy.mjs normalizeMiniMaxJson
const NORMALIZE_FN = `function normalizeMiniMaxJson(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalizeMiniMaxJson);
  if (typeof value !== "object") return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "parsed" && typeof child === "boolean") {
      continue;
    }
    if (key === "user" && child === undefined) {
      out[key] = null;
      continue;
    }
    out[key] = normalizeMiniMaxJson(child);
  }
  if (out.type === "output_text") {
    if (!Array.isArray(out.logprobs)) out.logprobs = [];
    if (!Array.isArray(out.annotations)) out.annotations = [];
  }
  return out;
}`;

let src = fs.readFileSync(target, 'utf8');
if (src.includes(TOSTORED_MARK)) {
  console.error('already patched:', target);
  process.exit(0);
}

if (!src.includes(MARK)) {
  const ORIGINAL =
    'parsed: z12.record(z12.string(), z12.unknown()).exactOptional(),';
  const REPLACEMENT = `parsed: z12.preprocess((v) => (typeof v === "boolean" ? void 0 : v), z12.record(z12.string(), z12.unknown()).exactOptional()), ${MARK}`;
  const count = (src.match(/parsed: z12\.record\(z12\.string\(\), z12\.unknown\(\)\)\.exactOptional\(\),/g) || [])
    .length;
  if (count < 2) {
    console.error(`expected 2 parsed fields, found ${count}`);
    process.exit(1);
  }
  src = src.replaceAll(ORIGINAL, REPLACEMENT);
}

const anchor = '// src/llm/Lchain.ts';
if (!src.includes(anchor)) {
  console.error('Lchain anchor not found');
  process.exit(1);
}

src = src.replace(anchor, `${NORMALIZE_FN}\n\n${anchor}`);
src = src.replace(
  'const stored = serializeGeneration(generation);',
  `const stored = normalizeMiniMaxJson(serializeGeneration(generation)); ${TOSTORED_MARK}`,
);
src = src.replace(
  'return deserializeStoredGeneration(stored);',
  `return deserializeStoredGeneration(normalizeMiniMaxJson(stored)); ${TOSTORED_MARK}`,
);

fs.writeFileSync(target, src);
console.error(`patched ${target}`);
