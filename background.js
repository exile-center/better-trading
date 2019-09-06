// Constants
const POE_NINJA_API_BASE_URL =
  'https://poe.ninja/api';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.query === 'poe-ninja') {
    fetch(POE_NINJA_API_BASE_URL + request.resource)
      .then(response => response.json())
      .then(payload => sendResponse(payload))
      .catch(_error => sendResponse(null));
  }

  // Async response
  return true;
});
