/* eslint-env node */

'use strict';

module.exports = {
  reporters: ['html', 'json'],

  excludes: [
    '*/ember-cli-build.js',
    '*/testem.js',
    '*/app.js',
    '*/resolver.js',
    '*/router.js',
    '*/server.js',
    '*/translations.js',
    '*/config/**/*',
    '*/tests/**/*'
  ]
};
