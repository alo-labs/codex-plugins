#!/usr/bin/env node
/**
 * Preload shim for Alumnium + MiniMax: sanitize boolean `parsed` fields before
 * Alumnium's Lchain.toStored Zod validation.
 *
 * Import this module before `import { Alumni } from 'alumnium'`:
 *   node --import ./alumnium-minimax-shim.mjs your-script.mjs
 *
 * Or from ESM:
 *   import 'silver-bullet/scripts/alumnium-minimax-shim.mjs';
 */
import * as caches from '@langchain/core/caches';
import { normalizeMiniMaxJson } from './alumnium-minimax-proxy.mjs';

const original = caches.serializeGeneration;

caches.serializeGeneration = function serializeGenerationPatched(generation) {
  const stored = original.call(this, generation);
  return normalizeMiniMaxJson(stored);
};

// Re-export for explicit register hook
export { normalizeMiniMaxJson };
