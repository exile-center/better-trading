// Vendor
import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';

// Types
import {SafeString} from '@ember/template/-private/handlebars';

interface Styles {
  [key: string]: string;
}

export const safeStyles = ([styles]: [Styles]): SafeString => {
  const styleRules = Object.keys(styles).map((attribute) => {
    return `${attribute}: ${styles[attribute]};`;
  });

  return htmlSafe(styleRules.join(''));
};

export default helper(safeStyles);
