/* eslint-env node */
'use strict';

// Vendor
const url = require('url');

// Constants
const PERMANENT_REDIRECT_STATUS_CODE = 301;

module.exports = (request, response, next) => {
  const parsedUrl = url.parse(request.url);

  if (!parsedUrl.pathname.match(/^.+\/$/)) return next();

  response.redirect(
    PERMANENT_REDIRECT_STATUS_CODE,
    parsedUrl.pathname.replace(/\/+$/, '')
  );
};
