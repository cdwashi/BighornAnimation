import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['engine/src/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error',
        { name: 'Date', message: 'Engine time comes from the simulation clock.' },
        { name: 'performance', message: 'Engine code may not consult wall-clock time.' },
        { name: 'document', message: 'The engine is headless.' },
        { name: 'window', message: 'The engine is headless.' },
      ],
      'no-restricted-properties': ['error',
        { object: 'Date', property: 'now', message: 'Engine time comes from the simulation clock.' },
        { object: 'Math', property: 'random', message: 'Use engine/src/rng.ts.' },
        { object: 'performance', property: 'now', message: 'Engine code may not consult wall-clock time.' },
      ],
      'no-restricted-imports': ['error', {
        paths: ['react', 'react-dom', 'next', 'next/react'],
        patterns: ['node:*', 'react/*', 'react-dom/*', 'next/*'],
      }],
    },
  },
);
