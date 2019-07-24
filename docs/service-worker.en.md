# Service Worker

This document is not under any consideration a complete reference, it aims rather to explain basic concepts surrounding service workers and how they’re used inside this boilerplate.

## 🎯 Objectives

### Why do we use a service worker in our applications?

TLDR; We use a service worker to cache the application’s assets and load them instantly when the user comes back to the site.

A service worker can do several things: subscribe to push notifications, receive background sync events, etc. But the main reason why we use it is to intercept HTTP requests.

When our app is loaded by the browser, it installs the service worker. This service worker, while its installation phase, downloads our application’s assets in the background. Once the assets are downloaded, they are cached for future use. As soon as the user comes back to our app, we will serve them the assets from the cache. This gives us a free performance gain since the browser doesn’t make HTTP requests for load our app’s shell! If you put a little effort into it, it’s possible to make the whole app work offline.

## ⚙️ How it works

### How does the service worker installation work in the boilerplate?

#### On the first visit

The browser downloads the service worker then starts the installation process. Our setup will follow these steps:

1. Download the `asset-cache-manifest.json` file
2. Download all assets listed in the manifest. It includes:

   - JavaScript files
   - CSS files
   - Images
   - Fonts
   - The `index.html` file which is aliased as `/assets/index-{app version}.html` to avoid caching issues
   - Source maps for JavaScript and CSS files

3. Cache downloaded files
4. Activate the service worker to intercept following requests

![](assets/sw-installing.gif)

**Note:**

- If one of these steps fails, the installation is cancelled and the service worker will not be activated.
- If the app depends on third party static assets like Google Fonts or similar, we can add them to the list of assets to be cached in the `service-worker/index.js` file.
- The `index.html` file must be cached since when the app is served by the service worker, FastBoot will be completely skipped so we must provide a shell for our app to boot.

#### On subsequent visits

The browser will re-download the service worker, if the file is « byte for byte » identical, the current service worker will continue to be active without anything else happening.

On the other hand, if the file did change, the browser will start the installation process for the new worker while leaving the old worker intercept requests. The installation process is the same that we wennt through on the first visit except that the new service worker is not activated right now; it’s in a waiting state.

A worker in waiting state can be activated by 2 events:

- the user navigates; via a refresh or to another page
- our app forces a navigation; via a refresh or to another page

Note: "another page" means another page that is not a page in the Ember app, these don’t reload the HTML like a standard navigation would

![](assets/sw-waiting.gif)

**The basic setup in the boilerplate forces a refresh as soon as the installation is done. However, tools are at your disposal to show a message to the user prompting to install the update before reloading.**

When a new service worker is installed, the old one becomes « redundant » that is to say the browser will delete it at one point but it doesn’t receive any requests. Its cache will also be deleted to avoid exceeding the disk space quota we have.

## Tools at your disposal

### Chrome DevTools

Service workers are easily accessible through Chrome’s DevTools. To this day, it’s the most advanced tool to debug a service worker. You can see your worker along with its cache in “Application” section.

In development we often want to skip the service worker altogether to have the latest version of our code; it’s possible to ask Chrome to refresh the service worker code on every refresh:

![](assets/update-on-reload.png)

### Ember service `service-worker.js`

To facilitate the interaction with the service worker, the boilerplate also contains a service named `service-worker` which can do basic operations on the worker.

## 📬 Updates

### I deployed a new version of my app, how do I notify the users?

Since this scenario is a little bit « case by case » it’s not implémented by default in the boilerplate. However, it’s pretty simple to achieve with our service.

```
import {task, timeout} from 'ember-concurrency';

// ...

serviceWorkerUpdateCheckTask: task(function *() {
  while (true) {
    this.serviceWorker.checkForUpdates();

    yield timeout(ONE_HOUR_IN_MILLISECONDS);
  }
})

// ...

this.serviceWorker.onUpdateReady(() => {
  const response = this.confirmDialog.show({
    message: 'Update available',
    confirmLabel: 'Update now',
    cancelLabel: 'Cancel'
  });

  if (response) this.serviceWorker.update();
});
```

**Note:** This code asks the browser to periodically update the service worker, know that these updates are rate-limited by the browser, **never ask for updates every minute** for example.

Also note that `checkForUpdates` will go through the normal update process, you will be notified through the `onUpdateReady` callback just like a normal page refresh would do.
