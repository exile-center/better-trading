/* eslint-env node */

'use strict';

const PACKAGE = require('../package.json');
const {asBoolean} = require('./utils');

// This function is used to build an `ENV` variable from environment variables
// when running `ember build`. This variable will be injected into the browser
// running the application and used by the server-side process that renders
// FastBoot responses.
//
// Therefore, it MUST NOT be used to store secret keys and values.

// eslint-disable-next-line complexity
module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'better-trading',
    podModulePrefix: 'better-trading/pods',
    environment,
    rootURL: '/',
    locationType: 'auto'
  };

  ENV.EmberENV = {
    LOG_VERSION: false,
    EXTEND_PROTOTYPES: false
  };

  ENV.APP = {
    version: PACKAGE.version
  };

  ENV.apollo = {
    apiURL: `${process.env.API_BASE_URL}${process.env.API_GRAPHQL_PATH}`,
    SSR_CACHE_KEY: 'apollo-cache'
  };

  ENV.contentSecurityPolicy = {
    'default-src': "'none'",
    'form-action': "'self'",
    'media-src': "'self'",
    'img-src': ["'self'", 'data:'],
    'script-src':
      environment === 'production'
        ? ["'self'"]
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'font-src': ["'self'"],
    'connect-src': ["'self'", 'https://sentry.io', process.env.API_BASE_URL],
    'style-src': ["'self'"]
  };

  ENV.fastboot = {
    fastbootHeaders: true,
    hostWhitelist: process.env.CANONICAL_HOST
      ? [process.env.CANONICAL_HOST]
      : []
  };

  ENV.intl = {
    ASYNC_TRANSLATIONS: asBoolean(process.env.ASYNC_TRANSLATIONS)
  };

  ENV.sentry = {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT_NAME,
    release: PACKAGE.version,
    whitelistUrls: [process.env.ASSETS_CDN_HOST || process.env.CANONICAL_HOST],
    // If set to true, it will prevent Raven.js from being initialized.
    // Errors and logs will be logged to the console (default) instead of
    // being reported by Raven.
    development: !process.env.SENTRY_DSN
  };

  if (environment === 'test') {
    ENV.locationType = 'none';

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.apollo = {
      apiURL: 'graphql://fake/endpoint',
      SSR_CACHE_KEY: 'test-apollo-cache'
    };

    ENV.fastboot = {
      fastbootHeaders: true,
      hostWhitelist: [/.*/]
    };

    ENV.intl.ASYNC_TRANSLATIONS = false;
  }

  return ENV;
};
