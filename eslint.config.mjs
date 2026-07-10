import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    '.next-e2e/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
])

export default eslintConfig
