/* eslint-env node */

'use strict';

const fs = require('fs');
const glob = require('glob');
const addonPackage = require('./package');

module.exports = {
  name: addonPackage.name,

  isDevelopingAddon() {
    return false;
  },

  postBuild(results) {
    const appPackage = this.project.reloadPkg();

    fs.copyFileSync(`${results.directory}/index.html`, `${results.directory}/assets/index-${appPackage.version}.html`);

    const files = glob.sync('**/**/*', {cwd: results.directory, nodir: true});

    fs.writeFileSync(`${results.directory}/asset-cache-manifest.json`, JSON.stringify(files));
  }
};
