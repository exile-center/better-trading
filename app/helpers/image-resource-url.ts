// Vendor
import {helper} from '@ember/component/helper';

// Config
import config from 'better-trading/config/environment';

// Utilities
import {extensionApi} from 'better-trading/utilities/extension-api';

export const imageResourceUrl = ([path]: [string]) => {
  return extensionApi().runtime.getURL(`${config.APP.imageResourcePrefix}/${path}`);
};

export default helper(imageResourceUrl);
