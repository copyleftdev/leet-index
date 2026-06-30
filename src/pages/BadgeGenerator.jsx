import React, { useState, useEffect, useCallback } from 'react';
import { cache, CACHE_KEYS } from '../utils/cache';

const FORMATS = ['Markdown', 'HTML', 'reStructuredText'];

function badgeUrl(username, rank) {
  const label = encodeURIComponent('LeetIndex');
  const message = encodeURIComponent(rank ? `#${rank}` : 'unranked');
  const color = rank ? 'C97D1E' : '555';
  return `https://img.shields.io/badge/${label}-${message}-${color}?style=flat-square&logo=github`;
}

function getSnippet(format, username, rank) {
  const url = badgeUrl(username, rank);
  const alt = `LeetIndex rank for ${username}`;
  const link = `https://leetindex.com`;
  switch (format) {
    case 'Markdown':
      return `[![${alt}](${url})](${link})`;
    case 'HTML':
      return `<a href="${link}"><img src="${url}" alt="${alt}" /></a>`;
    case 'reStructuredText':
      return `.. image:: ${url}\n   :target: ${link}\n   :alt: ${alt}`;
    default:
      return '';
  }
}

export default function BadgeGenerator({ initialUsername, onInitialUsernameConsumed }) {
  const [username, setUsername] = useState(initialUsername || '');
  const [format, setFormat] = useState('Markdown');
  const [copied, setCopied] = useState(false);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
      onInitialUsernameConsumed?.();
    }
  }, [initialUsername, onInitialUsernameConsumed]);

  // Look up rank from cached leaderboard
  useEffect(() => {
    if (!username.trim()) { setRank(null); return; }
    const payload = cache.get(CACHE_KEYS.LEADERBOARD);
    const lb = payload?.leaderboard ?? [];
    const entry = lb.find((d) => d.username.toLowerCase() === username.trim().toLowerCase());
    setRank(entry?.rank ?? null);
  }, [username]);

  const snippet = getSnippet(format, username.trim() || 'your-username', rank);
  const preview = badgeUrl(username.trim() || 'your-username', rank);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = snippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [snippet]);

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 pt-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-1 tracking-tight mb-1">Badge Generator</h1>
        <p className="text-sm text-ink-3 max-w-prose">
          Add your LeetIndex rank to your GitHub profile README. The badge updates automatically as your rank changes.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-2xs font-display tracking-widest text-ink-3 mb-1.5">GITHUB USERNAME</label>
          <div className="flex">
            <span className="flex items-center px-2 bg-canvas-2 border border-r-0 border-edge-2 text-ink-3 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 bg-canvas-2 border border-edge-2 focus:border-amber focus:outline-none text-sm font-body text-ink-1 placeholder:text-ink-3 px-3 py-2 transition-colors"
              style={{ borderRadius: 0 }}
            />
          </div>
          {username.trim() && rank === null && (
            <p className="text-xs text-ink-3 mt-1">Not found in current index — badge will show "unranked" until next batch.</p>
          )}
          {rank && (
            <p className="text-xs text-tier-merge mt-1">Found — current rank #{rank}</p>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-canvas-2 border border-edge-1 p-4 mb-4">
        <div className="text-2xs font-display tracking-widest text-ink-3 mb-3">PREVIEW</div>
        <div className="flex items-center gap-3 min-h-8">
          <img
            src={preview}
            alt="Badge preview"
            className="h-5"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {!username.trim() && <span className="text-xs text-ink-3">Enter a username above</span>}
        </div>
      </div>

      {/* Format tabs */}
      <div className="flex border-b border-edge-2 mb-0">
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={[
              'font-display text-2xs tracking-widest px-4 py-2 transition-colors',
              format === f
                ? 'text-amber border-b-2 border-amber -mb-px'
                : 'text-ink-3 hover:text-ink-2',
            ].join(' ')}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Snippet */}
      <div className="bg-canvas-2 border border-edge-1 border-t-0 p-4 mb-3">
        <pre className="text-xs font-body text-amber whitespace-pre-wrap break-all leading-relaxed">
          {snippet}
        </pre>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="w-full font-display text-sm tracking-widest py-2.5 transition-all duration-150"
        style={{
          backgroundColor: copied ? 'var(--tier-merge)' : 'var(--amber)',
          color: 'var(--canvas-1)',
        }}
      >
        {copied ? '✓ COPIED' : 'COPY BADGE'}
      </button>

      <div className="mt-8 space-y-3 text-xs text-ink-3 font-body pb-8">
        <div className="font-display text-2xs tracking-widest">// HOW IT WORKS</div>
        <p>Badges are served by Shields.io with your current rank baked in at badge-generation time. To get a live-updating badge, deploy the Cloudflare Worker included in this repo — it reads from the latest <code className="text-amber">data.json</code> and serves fresh rank data on each request.</p>
      </div>
    </main>
  );
}
