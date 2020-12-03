![logo](https://user-images.githubusercontent.com/4255460/70675096-29118280-1c56-11ea-8e58-c8e74423d0eb.png)

# Better trading

A browser extension that enhance the pathofexile.com/trade experience.

<a href="https://chrome.google.com/webstore/detail/better-pathofexile-tradin/fhlinfpmdlijegjlpgedcmglkakaghnk" target="_blank">
  <img src="./.github/readme/chrome-button.png" alt="Download for Google Chrome">
</a>

## Why not in Firefox ?

- Initially, the extension did not work in Firefox. Booting Ember.js as a browser extension is not something that works well within Firefox's addon runtime. The first Firefox version relied on hacks and as expected, it broke after doing some updates. Having to hack into libs to make sure they can work in Firefox is not something that I want to do in my spare time;
- Firefox addon store review process for new updates is way more strict and time-consuming to deal with compared to Chrome's;
- The project is developed as a Chrome-first project, which means problems can be quickly detected during development instead of having to test everything twice;
- Now that both Chrome and Firefox versions have been live for a while, I can see that Firefox represented less than 10% of BetterTrading users;

In the meantime, you can continue to use version [1.3.2 on Firefox](https://addons.mozilla.org/en-US/firefox/addon/better-pathofexile-trading/) or you can use Chrome for your PoE business ✌️

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
