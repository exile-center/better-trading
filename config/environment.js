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
    EXTEND_PROTOTYPES: false
  };

  ENV.APP = {
    version: PACKAGE.version
  };

  ENV.fontawesome = {
    icons: {
      'free-solid-svg-icons': ['chevron-down']
    }
  };

  if (environment === 'test') {
    ENV.locationType = 'none';

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
