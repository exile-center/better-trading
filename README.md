![logo](https://user-images.githubusercontent.com/4255460/70675096-29118280-1c56-11ea-8e58-c8e74423d0eb.png)

# Better trading

A browser extension that enhance the pathofexile.com/trade experience.

## Install links

<a href="https://chrome.google.com/webstore/detail/better-pathofexile-tradin/fhlinfpmdlijegjlpgedcmglkakaghnk" target="_blank">
  <img src="./.github/readme/chrome-button.png" alt="Download for Google Chrome">
</a>
<a href="https://addons.mozilla.org/en-CA/firefox/addon/better-pathofexile-trading" target="_blank">
  <img src="./.github/readme/firefox-button.png" alt="Download for Firefox">
</a>

## Why not in Firefox ?

...

## Features

- Bookmarks manager
- Equivalent pricing calculator (powered by [poe.ninja](https://poe.ninja/))
- Searched mods highlighting
- ... more to come !

## Contributing

1. Make sure Node.js (v10.15.x) and NPM (v6.4.x) are installed;
2. Install the dependencies with `make dependencies`;
3. Build the project with `make dev`;
4. Install the local extension located at `./dist/dev`.

The command `make package` can be used to generated the store-ready zip files (chrome and firefox).

Don't forget to run `make help` to know more about the other commands.

**Useful resources**

- [How to install a local extension](https://developer.chrome.com/extensions/getstarted)
- [Extension reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)
