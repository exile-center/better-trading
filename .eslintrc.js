module.exports = {
  root: true,
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      },
      plugins: ['@typescript-eslint', 'ember', 'mirego'],
      extends: [
        'plugin:mirego/recommended',
        'prettier',
        'prettier/@typescript-eslint'
      ],
      files: ['app/**/*', 'tests/**/*', 'types/**/*'],
      env: {
        es6: true,
        browser: true
      },
      rules: {
        'ember/closure-actions': 2,
        'ember/named-functions-in-promises': 0,
        'ember/new-module-imports': 2,
        'ember/no-global-jquery': 2,
        'ember/no-on-calls-in-components': 2,
        'ember/no-duplicate-dependent-keys': 2,
        'ember/no-side-effects': 2,
        'ember/require-super-in-init': 2,
        'ember/avoid-leaking-state-in-ember-objects': 2,
        'ember/use-brace-expansion': 2,
        '@typescript-eslint/adjacent-overload-signatures': 2,
        '@typescript-eslint/array-type': [2, {default: 'array-simple'}],
        '@typescript-eslint/await-thenable': 2,
        '@typescript-eslint/ban-ts-ignore': 2,
        '@typescript-eslint/consistent-type-assertions': [
          2,
          {assertionStyle: 'as'}
        ],
        '@typescript-eslint/consistent-type-definitions': [2, 'interface'],
        '@typescript-eslint/member-delimiter-style': [
          2,
          {
            multiline: {
              delimiter: 'semi',
              requireLast: true
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false
            }
          }
        ],
        '@typescript-eslint/member-ordering': 2,
        '@typescript-eslint/no-empty-interface': 2,
        '@typescript-eslint/no-floating-promises': 2,
        '@typescript-eslint/no-misused-new': 2,
        '@typescript-eslint/no-misused-promises': 2,
        '@typescript-eslint/no-non-null-assertion': 2,
        '@typescript-eslint/no-parameter-properties': 2,
        '@typescript-eslint/no-require-imports': 2,
        '@typescript-eslint/no-unnecessary-type-assertion': 2,
        '@typescript-eslint/promise-function-async': 2,
        '@typescript-eslint/require-await': 2,
        '@typescript-eslint/type-annotation-spacing': 2,
        '@typescript-eslint/unified-signatures': 2,
        'no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': [
          'error',
          {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}
        ]
      }
    },
    {
      files: [
        '.ember-cli.js',
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'config/**/*.js',
        'lib/*/index.js',
        'scripts/**/*.js',
        'node-server/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: {
        '@typescript-eslint/no-require-imports': 0,
        'no-process-exit': 0,
        'node/no-extraneous-require': 0,

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off'
      },
      extends: ['plugin:node/recommended']
    }
  ]
};
