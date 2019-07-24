/* eslint-env node */

'use strict';

// Vendor
const FastBootAppServer = require('fastboot-app-server');
const Raven = require('raven');
const basicAuth = require('express-basic-auth');
const compression = require('compression');
const forceSSL = require('express-force-ssl');
const forceDomain = require('forcedomain');
const cacheControl = require('express-cache-controller');

// Custom HTTP Server
const HTTPServer = require('./express-http-server');

// Middleware
const internalServerErrorMiddleware = require('./middleware/internal-server-error');
const stripTrailingSlashes = require('./middleware/strip-trailing-slashes');
const deduplicateSlashes = require('./middleware/deduplicate-slashes');

// Utils
const {asBoolean, asInteger} = require('../config/utils');
const PACKAGE = require('../package.json');

// Constants
const OK_HTTP_CODE = 200;
const FORCE_SSL_OPTIONS = {trustXFPHeader: true, httpsPort: 443};
const ASSETS_MAX_AGE = 2592000; // 1 month
const BASIC_AUTH_OPTIONS = {
  users: {
    [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD
  },
  challenge: true
};

// Server
const httpServer = new HTTPServer({
  afterMiddleware(app) {
    if (process.env.SENTRY_SECRET_DSN) app.use(Raven.errorHandler());
    app.use(internalServerErrorMiddleware);
  }
});

const app = httpServer.app;

// Health check
app.get('/health', (_, response) => {
  response.send({status: 'OK', version: PACKAGE.version});
  response.sendStatus(OK_HTTP_CODE);
});

// Sentry
if (process.env.SENTRY_SECRET_DSN) {
  Raven.config(process.env.SENTRY_SECRET_DSN).install();
  app.use(Raven.requestHandler());
}

// Canonical host
if (process.env.CANONICAL_HOST) {
  app.use(forceDomain({hostname: process.env.CANONICAL_HOST}));
}

// Force SSL
if (asBoolean(process.env.FORCE_SSL)) {
  app.set('forceSSLOptions', FORCE_SSL_OPTIONS);
  app.use(forceSSL);
}

// Basic Authentication
if (process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
  app.use(basicAuth(BASIC_AUTH_OPTIONS));
}

// Remove a few slashes
app.use(stripTrailingSlashes);
app.use(deduplicateSlashes);

// Gzip
app.use(compression());

// Cache headers
app.use(
  '/sw.js',
  cacheControl({
    noCache: true,
    private: true,
    noStore: true,
    mustRevalidate: true
  })
);

if (process.env.PAGES_CACHE_DURATION_IN_SECONDS) {
  app.use(
    cacheControl({
      maxAge: asInteger(process.env.PAGES_CACHE_DURATION_IN_SECONDS)
    })
  );
} else {
  app.use(cacheControl({noCache: true}));
}

// Assets
app.use('/assets/*', (_, response, next) => {
  response.cacheControl = {maxAge: ASSETS_MAX_AGE};
  next();
});

const server = new FastBootAppServer({
  distPath: 'dist',
  workerCount: asInteger(process.env.WORKER_COUNT),
  httpServer,
  chunkedResponse: true
});

server.start();
