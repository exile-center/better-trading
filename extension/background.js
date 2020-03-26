var extensionApi;

if (typeof browser !== 'undefined') extensionApi = browser;
else if (typeof chrome !== 'undefined') extensionApi = chrome;

if (!extensionApi) throw new Error('extension API not found. Both `chrome` and `browser` are undefined.');

extensionApi.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.query === 'poe-ninja') {
    fetch('https://poe.ninja/api' + request.resource)
      .then(function(response) { return response.json() })
      .then(function(payload) { sendResponse(payload) })
      .catch(function(_error) { sendResponse(null) });
  }

  return true;
});
