// Vendor
import {helper} from '@ember/component/helper';

// Config
import config from 'better-trading/config/environment';

export const imageResourceUrl = ([path]: [string]) => {
  return window.chrome.runtime.getURL(`${config.APP.imageResourcePrefix}/${path}`);
};

export default helper(imageResourceUrl);
