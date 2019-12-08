chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.query === 'poe-ninja') {
    fetch('https://poe.ninja/api' + request.resource)
      .then(function(response) { return response.json() })
      .then(function(payload) { sendResponse(payload) })
      .catch(function(_error) { sendResponse(null) });
  }

  return true;
});
