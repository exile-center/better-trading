// Vendor
import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';

// Types
import {SafeString} from '@ember/template/-private/handlebars';

export const htmlSafeHelper = ([rawHtml]: [string]): SafeString => {
  return htmlSafe(rawHtml);
};

export default helper(htmlSafeHelper);
