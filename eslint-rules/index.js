/**
 * Local ESLint plugin for MePipe project conventions.
 *
 * Rules are in ./rules/ — each file is one rule.
 * To add a new rule:
 *   1. Create eslint-rules/rules/your-rule-name.js
 *   2. Add it to the `rules` object below
 *   3. Enable it in eslint.config.mjs under rules: { 'local/your-rule-name': 'warn' }
 */

const noUncachedPrisma = require('./rules/no-uncached-prisma');
const requireCacheKeysConstant = require('./rules/require-cache-keys-constant');
const requireLinkPrefetch = require('./rules/require-link-prefetch');
const requireLoadingPage = require('./rules/require-loading-page');

module.exports = {
  rules: {
    'no-uncached-prisma': noUncachedPrisma,
    'require-cache-keys-constant': requireCacheKeysConstant,
    'require-link-prefetch': requireLinkPrefetch,
    'require-loading-page': requireLoadingPage,
  },
};
