/* eslint-env node */

'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const targets = require('./config/targets');

const IS_TEST_ENVIRONMENT = EmberApp.env() === 'test';

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    hinting: false,
    storeConfigInMeta: false,
    tests: IS_TEST_ENVIRONMENT,

    'ember-cli-uglify': {
      enabled: false,
    },

    vendorFiles: {
      'jquery.js': null,
    },

    autoprefixer: {
      browsers: targets.browsers,
      sourcemap: false,
    },

    cssModules: {
      intermediateOutputPath: 'app/styles/_pods.scss',
      extension: 'module.scss',
      postcssOptions: {
        syntax: require('postcss-scss'),
      },
    },

    babel: {
      plugins: [require('ember-auto-import/babel-plugin'), 'transform-object-rest-spread'],
      sourceMaps: 'inline',
    },

    'ember-cli-babel': {
      includePolyfill: true,
    },

    sourcemaps: {
      enabled: !IS_TEST_ENVIRONMENT,
    },

    fingerprint: {
      enabled: false,
    },
  });

  return app.toTree();
};
