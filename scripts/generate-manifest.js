/* eslint-env node */

const fs = require('fs');

const [target] = process.argv.slice(2);

const outputPath = {
  dev: './dist/dev/manifest.json',
  production: './dist/staged/manifest.json',
}[target];

const packageJson = JSON.parse(fs.readFileSync('./package.json'));

const assetsPathFor = (assetsRelativePath) => {
  const path = `assets/${assetsRelativePath}`;

  if (target === 'production') return path;
  return `ember-build/${path}`;
};

const manifest = Object.assign(
  {
    version: packageJson.version,
    manifest_version: 2,
    content_scripts: [
      {
        matches: ['*://www.pathofexile.com/trade*'],
        js: [assetsPathFor('vendor.js'), assetsPathFor('better-trading.js')],
        css: [assetsPathFor('vendor.css'), assetsPathFor('better-trading.css')],
      },
    ],
    background: {
      scripts: ['background.js'],
      persistent: true,
    },
    permissions: ['storage', '*://poe.ninja/*'],
    web_accessible_resources: [assetsPathFor('images/*')],
    icons: {
      16: 'icon16.png',
      48: 'icon48.png',
      64: 'icon64.png',
      128: 'icon128.png',
    },
  },
  packageJson.manifest
);

fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
