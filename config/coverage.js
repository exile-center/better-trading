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
    '*/services/apollo.js',
    '*/services/service-worker.js',
    '*/translations.js',
    '*/config/**/*',
    '*/tests/**/*',
    '*/graphql/**/*'
  ]
};
