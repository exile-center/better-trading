/* eslint-env node */

'use strict';

module.exports = {
  asBoolean: variable => ['true', '1'].includes(variable),
  asInteger: variable => parseInt(variable, 10)
};
