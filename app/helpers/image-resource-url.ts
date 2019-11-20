// Vendor
import {helper} from '@ember/component/helper';

// Constants
const PATH_PREFIX = 'dist/assets/images';

export const imageResourceUrl = ([path]: [string]) => {
  return window.chrome.runtime.getURL(`${PATH_PREFIX}/${path}`);
};

export default helper(imageResourceUrl);
