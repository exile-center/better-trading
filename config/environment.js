/* eslint-env node */

'use strict';

const PACKAGE = require('../package.json');

// eslint-disable-next-line complexity
module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'better-trading',
    podModulePrefix: 'better-trading/pods',
    environment,
    locationType: 'hash',
    rootURL: '/'
  };

  ENV.EmberENV = {
    LOG_VERSION: false,
    EXTEND_PROTOTYPES: false,
    FEATURES: {
      EMBER_METAL_TRACKED_PROPERTIES: true
    }
  };

  ENV.APP = {
    version: PACKAGE.version,
    imageResourcePrefix: environment === 'development' ? 'ember-build/assets/images' : 'assets/images'
  };

  ENV.fontawesome = {
    icons: {
      'free-solid-svg-icons': [
        'chevron-down',
        'folder-plus',
        'save',
        'trash-alt',
        'compress-arrows-alt',
        'check',
        'times',
        'pen',
        'bars',
        'cogs',
        'arrow-left'
      ]
    }
  };

  if (environment === 'test') {
    ENV.locationType = 'none';

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
