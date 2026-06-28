#!/usr/bin/env node
/**
 * Local OpenAI-compatible proxy for MiniMax + Alumnium v0.21.0.
 *
 * MiniMax may return `"parsed": true` (boolean) in chat/responses payloads.
 * Alumnium's LangChain layer expects `parsed` to be a record or absent
 * (LchainSchema.MessageDataAdditionalKwargs / MetadataOutputText).
 *
 * Usage:
 *   OPENAI_CUSTOM_URL=http://127.0.0.1:8787/v1 node your-alumnium-script.mjs
 *
 * Env:
 *   ALUMNIUM_MINIMAX_UPSTREAM — upstream base URL (default https://api.minimax.io/v1)
 *   ALUMNIUM_MINIMAX_PROXY_PORT — listen port (default 8787)
 */
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const UPSTREAM = (
  process.env.ALUMNIUM_MINIMAX_UPSTREAM || 'https://api.minimax.io'
).replace(/\/$/, '');
const PORT = Number(process.env.ALUMNIUM_MINIMAX_PROXY_PORT || 8787);

function upstreamPath(path) {
  // Client base URL ends with /v1 — requests arrive as /v1/chat/completions.
  // Upstream is https://api.minimax.io — forward /v1/... unchanged.
  if (path.startsWith('/v1/') || path === '/v1') return path;
  if (path.startsWith('/')) return `/v1${path}`;
  return `/v1/${path}`;
}

/** Recursively coerce MiniMax/OpenAI-compat payloads for Alumnium LchainSchema. */
export function normalizeMiniMaxJson(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalizeMiniMaxJson);
  if (typeof value !== 'object') return value;

  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === 'parsed' && typeof child === 'boolean') {
      // MiniMax boolean sentinel — not structured output; omit for Alumnium Zod.
      continue;
    }
    if (key === 'user' && child === undefined) {
      out[key] = null;
      continue;
    }
    out[key] = normalizeMiniMaxJson(child);
  }

  // MetadataOutputText requires logprobs + annotations arrays
  if (out.type === 'output_text') {
    if (!Array.isArray(out.logprobs)) out.logprobs = [];
    if (!Array.isArray(out.annotations)) out.annotations = [];
  }

  return out;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function forwardRequest(method, path, headers, body) {
  const target = new URL(`${UPSTREAM}${upstreamPath(path)}`);
  const lib = target.protocol === 'https:' ? https : http;
  const fwdHeaders = { ...headers, host: target.host };
  delete fwdHeaders['content-length'];
  delete fwdHeaders['transfer-encoding'];

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        method,
        path: `${target.pathname}${target.search}`,
        headers: fwdHeaders,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    req.on('error', reject);
    if (body?.length) req.write(body);
    req.end();
  });
}

function isSseResponse(headers) {
  const ct = headers['content-type'] || '';
  return ct.includes('text/event-stream');
}

/** Normalize SSE data lines when content-type is event-stream. */
function normalizeSseBody(text) {
  return text
    .split('\n')
    .map((line) => {
      if (!line.startsWith('data:')) return line;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') return line;
      try {
        const parsed = JSON.parse(payload);
        return `data: ${JSON.stringify(normalizeMiniMaxJson(parsed))}`;
      } catch {
        return line;
      }
    })
    .join('\n');
}

const server = http.createServer(async (req, res) => {
  try {
    const body = await readBody(req);
    const path = req.url || '/';
    const headers = { ...req.headers };
    delete headers.host;

    const upstream = await forwardRequest(req.method || 'GET', path, headers, body);
    let outBody = upstream.body;
    const outHeaders = { ...upstream.headers };

    if (!isSseResponse(outHeaders)) {
      const ct = outHeaders['content-type'] || '';
      if (ct.includes('application/json') && outBody.length) {
        try {
          const json = JSON.parse(outBody.toString('utf8'));
          outBody = Buffer.from(JSON.stringify(normalizeMiniMaxJson(json)));
          outHeaders['content-length'] = String(outBody.length);
        } catch {
          /* pass through non-JSON */
        }
      }
    } else {
      const text = outBody.toString('utf8');
      const normalized = normalizeSseBody(text);
      outBody = Buffer.from(normalized);
      outHeaders['content-length'] = String(outBody.length);
    }

    res.writeHead(upstream.status, outHeaders);
    res.end(outBody);
  } catch (err) {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { message: String(err.message || err) } }));
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(PORT, '127.0.0.1', () => {
    console.error(
      `alumnium-minimax-proxy listening on http://127.0.0.1:${PORT}/v1 -> ${UPSTREAM}/v1`,
    );
  });
}
