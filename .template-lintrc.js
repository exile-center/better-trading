/* eslint-env node */

'use strict';

module.exports = {
  rules: {
    'attribute-indentation': {'open-invocation-max-len': 80},
    'block-indentation': 2,
    'eol-last': 'always',
    'inline-link-to': true,
    'link-rel-noopener': true,
    'no-bare-strings': true,
    'no-debugger': true,
    'no-duplicate-attributes': true,
    'no-html-comments': true,
    'no-implicit-this': true,
    'no-log': true,
    'no-outlet-outside-routes': true,
    'no-shadowed-elements': true,
    'no-trailing-spaces': true,
    'no-triple-curlies': true,
    'no-unused-block-params': true,
    'quotes': 'double',
    'self-closing-void-elements': true,
    'simple-unless': true,
    'style-concatenation': true,
    'table-groups': true,
    'template-length': [true, {min: 1, max: 200}]
  }
};
