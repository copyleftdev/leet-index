import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-edge-1 mt-16 py-6 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-body text-ink-3">
        <div className="flex items-center gap-4">
          <span className="font-display text-2xs tracking-widest text-ink-3">LEETINDEX</span>
          <span className="text-edge-2">·</span>
          <span>Updated hourly · 24 rolling batches</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/copyleftdev/leet-index"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber transition-colors"
          >
            Source
          </a>
          <span className="text-edge-2">·</span>
          <span>Data from GitHub public API</span>
          <span className="text-edge-2">·</span>
          <span>Not affiliated with GitHub, Inc.</span>
        </div>
      </div>
    </footer>
  );
}
