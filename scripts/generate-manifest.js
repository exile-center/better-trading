/* eslint-env node */

const fs = require('fs');

const [target] = process.argv.slice(2);

const outputPath = {
  dev: './dist/dev/manifest.json',
  production: './dist/staged/manifest.json'
}[target];

const packageJson = JSON.parse(fs.readFileSync('./package.json'));

const assetsPathFor = assetsRelativePath => {
  const path = `assets/${assetsRelativePath}`;

  if (target === 'production') return path;
  return `ember-build/${path}`;
};

const manifest = Object.assign({
  version: packageJson.version,
  manifest_version: 2,
  content_scripts: [
    {
      matches: ['*://www.pathofexile.com/trade/*'],
      js: [assetsPathFor('vendor.js'), assetsPathFor('better-trading.js')],
      css: [assetsPathFor('vendor.css'), assetsPathFor('better-trading.css')]
    }
  ],
  background: {
    scripts: ['background.js'],
    persistent: false
  },
  permissions: ['*://poe.ninja/*'],
  web_accessible_resources: [assetsPathFor('images/*')]
}, packageJson.manifest);

fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
