import React from 'react';

const TABS = [
  {
    key: 'leaderboard',
    label: 'RANK',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="10" width="4" height="7" rx="1" />
        <rect x="7" y="6" width="4" height="11" rx="1" />
        <rect x="13" y="2" width="4" height="15" rx="1" />
      </svg>
    ),
  },
  {
    key: 'map',
    label: 'MAP',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="1,3 7,1 11,3 17,1 17,15 11,17 7,15 1,17" />
        <line x1="7" y1="1" x2="7" y2="15" />
        <line x1="11" y1="3" x2="11" y2="17" />
      </svg>
    ),
  },
  {
    key: 'register',
    label: 'CHECK',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="7" />
        <path d="M6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'badge',
    label: 'BADGE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 1l2.3 4.6L17 6.6l-4 3.9.9 5.5L9 13.5 4.1 16l.9-5.5L1 6.6l5.7-.9z" />
      </svg>
    ),
  },
  {
    key: 'about',
    label: 'ABOUT',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="7" />
        <line x1="9" y1="8" x2="9" y2="13" strokeLinecap="round" />
        <circle cx="9" cy="5.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function MobileTabBar({ activeTab, onChangeTab }) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-canvas-1 border-t border-edge-1 flex"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChangeTab(tab.key)}
          className={[
            'flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-100',
            activeTab === tab.key ? 'text-amber' : 'text-ink-3 hover:text-ink-2',
          ].join(' ')}
          aria-label={tab.label}
        >
          {tab.icon}
          <span className="font-display text-2xs tracking-wider">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
