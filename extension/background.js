var extensionApi;

if (typeof browser !== 'undefined') extensionApi = browser;
else if (typeof chrome !== 'undefined') extensionApi = chrome;

if (!extensionApi) throw new Error('extension API not found. Both `chrome` and `browser` are undefined.');

extensionApi.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.query === 'inject-mod-filtering') {
    if (!sender.tab || !sender.tab.id || !extensionApi.scripting) {
      sendResponse({ok: false});
      return;
    }

    extensionApi.scripting
      .executeScript({
        target: {tabId: sender.tab.id},
        world: 'MAIN',
        files: ['mod-filtering.js'],
      })
      .then(function() {
        sendResponse({ok: true});
      })
      .catch(function() {
        sendResponse({ok: false});
      });

    return true;
  }

  if (request.query === 'poe-ninja') {
    fetch('https://poe.ninja/api' + request.resource)
      .then(function(response) {
        return response.json();
      })
      .then(function(payload) {
        sendResponse(payload);
      })
      .catch(function(_error) {
        sendResponse(null);
      });

    return true;
  }
});
