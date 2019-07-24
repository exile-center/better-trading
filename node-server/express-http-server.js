/* eslint-env node */

'use strict';

// Vendor
const express = require('express');
const ExpressHTTPServer = require('fastboot-app-server/src/express-http-server');

// Constants
const NOT_FOUND_HTTP_CODE = 404;
const DEFAULT_PORT = 3000;

class HTTPServer extends ExpressHTTPServer {
  serve(fastbootMiddleware) {
    const app = this.app;

    this.beforeMiddleware(app);

    if (this.distPath) {
      app.get('/', fastbootMiddleware);
      app.use(express.static(this.distPath));

      app.get('/assets/*', (_, response) => {
        response.cacheControl = {noCache: true};
        response.sendStatus(NOT_FOUND_HTTP_CODE);
      });
    }

    app.get('/*', fastbootMiddleware);

    this.afterMiddleware(app);

    return new Promise(resolve => {
      const listener = app.listen(
        this.port || process.env.PORT || DEFAULT_PORT,
        this.host || process.env.HOST,
        () => {
          const host = listener.address().address;
          const port = listener.address().port;

          // eslint-disable-next-line no-console
          console.log('HTTP server started; url=http://%s:%s', host, port);

          resolve();
        }
      );
    });
  }
}

module.exports = HTTPServer;
