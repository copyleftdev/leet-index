export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ink-1': 'var(--ink-1)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'canvas-1': 'var(--canvas-1)',
        'canvas-2': 'var(--canvas-2)',
        'canvas-3': 'var(--canvas-3)',
        'edge-1': 'var(--edge-1)',
        'edge-2': 'var(--edge-2)',
        'amber': 'var(--amber)',
        'amber-2': 'var(--amber-2)',
        'amber-1': 'var(--amber-1)',
        'tier-init': 'var(--tier-init)',
        'tier-commit': 'var(--tier-commit)',
        'tier-merge': 'var(--tier-merge)',
        'tier-release': 'var(--tier-release)',
        'tier-legend': 'var(--tier-legend)',
        'signal-down': 'var(--signal-down)',
      },
      fontFamily: {
        display: ['Chakra Petch', 'sans-serif'],
        body: ['Red Hat Text', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};
