/* eslint-env node */

'use strict';

const fs = require('fs');

// Remove anything before and after the main <html> element
const template = fs
  .readFileSync('app/error-pages/internal-error-page.ts', 'utf8')
  .replace(/\n/g, ' ')
  .replace(/<\/html>.*/, '</html>')
  .replace(/.*<html>/, '<html>');

module.exports = (error, _request, response, _next) => {
  // eslint-disable-next-line no-console
  console.error(error);

  const responseHTML = template.replace(/\$\{error\}/, error);

  response.writeHead(response.statusCode, {
    'Content-Type': 'text/html; charset=UTF-8'
  });

  response.end(responseHTML);
};
