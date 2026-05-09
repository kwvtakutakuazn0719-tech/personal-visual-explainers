/**
 * Jina Reader（r.jina.ai）— URL を Markdown 風テキストに変換して取得する。
 *
 * 使い方（公式のパターン）:
 *   GET https://r.jina.ai/https://example.com/path
 *   先頭に Title / URL Source / Markdown Content などのメタ行が付くことが多い。
 *
 * 認証（任意）:
 *   Authorization: Bearer <JINA_API_KEY>
 *   無料でもキーなしで利用できるが、キーありの方がレート上限が緩い（公式ドキュメントの趣旨）。
 *
 * @see https://r.jina.ai/docs
 */

const READER_BASE = "https://r.jina.ai/";

/**
 * @param {string} url 取得したいページの絶対 URL（http / https）
 * @param {{ apiKey?: string; timeoutMs?: number; respondWith?: "markdown" | "text" }} [opts]
 * @returns {Promise<string>} レスポンス本文（多くは Markdown + メタ行）
 */
export async function fetchReaderMarkdown(url, opts = {}) {
  const target = String(url ?? "").trim();
  if (!/^https?:\/\//i.test(target)) {
    throw new Error("jina-reader: URL must start with http:// or https://");
  }

  const readerUrl = `${READER_BASE}${target}`;
  const timeoutMs = opts.timeoutMs ?? 55_000;
  const headers = {
    Accept: "text/plain,text/markdown,*/*",
  };
  const key = opts.apiKey ?? process.env.JINA_API_KEY;
  if (key) headers["Authorization"] = `Bearer ${key}`;
  if (opts.respondWith) headers["X-Respond-With"] = opts.respondWith;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(readerUrl, { method: "GET", headers, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`jina-reader: HTTP ${res.status} ${errText.slice(0, 200)}`);
  }
  return res.text();
}

/**
 * Reader の返却からタイトルと「Markdown 本文」部分をざっくり分離する。
 * @param {string} raw
 */
export function parseReaderResponse(raw) {
  const text = String(raw ?? "");
  const marker = "\nMarkdown Content:";
  const idx = text.indexOf(marker);
  const metaBlock = idx >= 0 ? text.slice(0, idx) : text;
  const body = idx >= 0 ? text.slice(idx + marker.length).trim() : text;

  let title = "";
  for (const line of metaBlock.split("\n")) {
    if (line.startsWith("Title:")) {
      title = line.slice("Title:".length).trim();
      break;
    }
  }
  const m = body.match(/^#\s+(.+)$/m);
  const heading = m ? m[1].trim() : "";
  return { title: title || heading, body, metaBlock };
}

/**
 * PA-API SearchItems 向けの短いクエリを、手入力が無いときだけ組む（ヒューリスティック）。
 * @param {string} brand
 * @param {{ title: string; body: string }} parsed
 */
export function guessAmazonKeywordsFromReader(brand, parsed) {
  const parts = [];
  const b = String(brand ?? "").trim();
  if (b) parts.push(b);
  const t = String(parsed.title ?? "").trim();
  if (t && (!b || t.toLowerCase() !== b.toLowerCase())) parts.push(t);
  const q = parts.join(" ").replace(/\s+/g, " ").trim();
  return q.slice(0, 400);
}
