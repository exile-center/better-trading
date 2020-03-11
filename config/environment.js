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
    imageResourcePrefix: environment === 'development' ? 'ember-build/assets/images' : 'assets/images',
    discordUrl: 'http://discord.exile.center',
    githubUrl: 'https://github.com/exile-center/better-trading',
    chaosRecipeOverlayUrl: 'https://github.com/exile-center/chaos-recipe-overlay'
  };

  ENV.fontawesome = {
    icons: {
      'free-solid-svg-icons': [
        'chevron-down',
        'folder-plus',
        'save',
        'trash-alt',
        'check',
        'times',
        'info-circle',
        'ellipsis-h',
        'sort',
        'compress-alt'
      ],
      'free-brands-svg-icons': ['github', 'discord']
    }
  };

  if (environment === 'test') {
    ENV.locationType = 'none';

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
