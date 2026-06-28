#!/usr/bin/env node
/** Minimal alumnium@0.21.0 patch: coerce MiniMax boolean/plain structured output in RetrieverAgent. */
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] || path.join(process.cwd(), 'node_modules/alumnium/src/client/index.js');
const MARK = '/* sb-minimax-retriever-patch */';

if (!fs.existsSync(target)) {
  console.error(`not found: ${target}`);
  process.exit(1);
}

let src = fs.readFileSync(target, 'utf8');
if (src.includes(MARK)) {
  console.error('already patched:', target);
  process.exit(0);
}

src = src.replace(
  'let value = response.structured.value;',
  `let structured = response.structured;
    if (structured === true || structured === false) {
      structured = { explanation: "Retrieved: " + structured, value: String(structured) };
    } else if (typeof structured === "string") {
      structured = { explanation: structured, value: structured };
    }
    let value = structured?.value ?? ""; ${MARK}`,
);

fs.writeFileSync(target, src);
console.error('patched', target);
