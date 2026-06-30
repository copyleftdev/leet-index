import React, { useState } from 'react';

const TABS = [
  { key: 'leaderboard', label: 'LEADERBOARD' },
  { key: 'map',         label: 'MAP' },
  { key: 'register',    label: 'REGISTER' },
  { key: 'badge',       label: 'BADGE' },
  { key: 'evolution',   label: 'EVOLUTION' },
  { key: 'about',       label: 'ABOUT' },
];

export default function Header({ activeTab, onChangeTab, searchTerm, onSearchChange }) {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-canvas-1 border-b border-edge-1 h-14">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 gap-4">

        {/* Wordmark */}
        <button
          type="button"
          onClick={() => onChangeTab('leaderboard')}
          className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity duration-100"
          aria-label="LeetIndex — home"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="4" fill="var(--amber)" />
            <text
              x="14" y="20"
              textAnchor="middle"
              fontFamily="Chakra Petch, sans-serif"
              fontWeight="700"
              fontSize="14"
              fill="oklch(13% 0.006 55)"
            >#1</text>
          </svg>
          <span
            className="font-display font-bold text-xl tracking-tight text-ink-1 hidden sm:block"
            style={{ letterSpacing: '-0.02em' }}
          >
            LEET<span className="text-amber">INDEX</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={[
                'font-display text-2xs tracking-widest px-3 py-1.5 transition-colors duration-100 whitespace-nowrap',
                activeTab === tab.key
                  ? 'text-amber border-b-2 border-amber pb-[5px]'
                  : 'text-ink-3 hover:text-ink-2',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1 shrink-0">
          {activeTab === 'leaderboard' && (
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search developer…"
              className="hidden lg:block bg-canvas-2 border border-edge-1 focus:border-amber focus:outline-none text-sm font-body text-ink-1 placeholder:text-ink-3 px-3 py-1 w-52 transition-colors duration-100"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* Notif stub */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif((v) => !v)}
              className="w-8 h-8 flex items-center justify-center text-ink-3 hover:text-ink-2 transition-colors"
              aria-label="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a5.5 5.5 0 0 0-5.5 5.5v1.19L1.1 10.1A1 1 0 0 0 2 11.75h12a1 1 0 0 0 .9-1.65L13.5 7.69V6.5A5.5 5.5 0 0 0 8 1zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" />
              </svg>
            </button>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 top-10 z-50 w-64 bg-canvas-2 border border-edge-2 p-4 font-body text-xs text-ink-3 shadow-xl">
                  <p className="font-display text-amber text-2xs tracking-widest mb-2">// NOTIFICATIONS</p>
                  <p className="leading-relaxed">Score update notifications are coming. For now, check back daily — batches run every hour.</p>
                  <p className="mt-2 text-ink-3 opacity-50">TODO: make this ring</p>
                </div>
              </>
            )}
          </div>

          <a
            href="https://github.com/copyleftdev/leet-index"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center text-ink-3 hover:text-ink-1 transition-colors"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
