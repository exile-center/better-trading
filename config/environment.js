/* eslint-env node */

'use strict';

const npmPackage = require('../package.json');
const fs = require('fs');

// eslint-disable-next-line complexity
module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'better-trading',
    podModulePrefix: 'better-trading/pods',
    environment,
    locationType: 'hash',
    rootURL: '/',
  };

  ENV.EmberENV = {
    LOG_VERSION: false,
    EXTEND_PROTOTYPES: false,
    FEATURES: {
      EMBER_METAL_TRACKED_PROPERTIES: true,
    },
  };

  ENV.APP = {
    version: npmPackage.version,
    changelog: npmPackage.changelog
      ? {
          markdown: fs.readFileSync(`./changelogs/${npmPackage.changelog}.md`, 'utf-8'),
          slug: npmPackage.changelog,
        }
      : null,
    imageResourcePrefix: environment === 'development' ? 'ember-build/assets/images' : 'assets/images',
    discordUrl: 'http://discord.exile.center',
    tftDiscordUrl: 'https://discord.gg/tftrove',
    githubUrl: 'https://github.com/exile-center/better-trading',
    chaosRecipeOverlayUrl: 'https://github.com/exile-center/chaos-recipe-overlay',
    browser: process.env.TARGET_BROWSER || 'chrome',
    locationPollingIntervalInMilliseconds: 500,
    maximumHistoryLength: 50,
  };

  ENV.flashMessageDefaults = {
    extendedTimeout: 200,
    timeout: 4500,
    types: ['alert', 'success', 'warning'],
  };

  ENV.fontawesome = {
    icons: {
      'free-solid-svg-icons': [
        'chevron-down',
        'folder-plus',
        'plus-square',
        'save',
        'trash-alt',
        'check',
        'times',
        'info-circle',
        'ellipsis-h',
        'sort',
        'compress-alt',
        'angle-right',
        'angle-left',
        'link',
        'clipboard',
        'file-import',
        'file-export',
        'exclamation-circle',
        'history',
        'folder-open',
        'circle-notch',
        'check-circle',
        'thumbtack',
        'archive',
        'undo',
      ],
      'free-brands-svg-icons': ['github', 'discord'],
    },
  };

  if (environment === 'test') {
    ENV.locationType = 'none';

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.APP.locationPollingIntervalInMilliseconds = 50;
    ENV.APP.maximumHistoryLength = 5;
  }

  return ENV;
};
