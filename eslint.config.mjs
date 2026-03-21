import nextConfig from 'eslint-config-next';
import localPlugin from './eslint-rules/index.js';

const eslintConfig = [
  // Next.js recommended rules (react, hooks, core-web-vitals, typescript)
  ...nextConfig,

  // Project-specific conventions
  {
    plugins: { local: localPlugin },
    rules: {
      // Warn when a prisma read call is not wrapped in cached().
      // Upgrade to 'error' once the team is comfortable with the rule.
      'local/no-uncached-prisma': 'warn',

      // Warn when cached() is called with a raw array instead of CACHE_KEYS.*
      'local/require-cache-keys-constant': 'warn',

      // Warn when <Link href="/..."> is missing explicit `prefetch`.
      // Next.js 15 defaults to hover-only prefetch — without this, quick clicks
      // show a blank gap before the skeleton. With prefetch, skeleton appears instantly.
      'local/require-link-prefetch': 'warn',

      // Warn when a page.tsx has no sibling loading.tsx.
      // loading.tsx is the Suspense skeleton — without it navigation shows a blank screen.
      'local/require-loading-page': 'warn',
    },
  },
];

export default eslintConfig;
