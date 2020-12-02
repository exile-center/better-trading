/* global require */

import ApplicationInstance from '@ember/application/instance';

export const initialize = (appInstance: ApplicationInstance): void => {
  const itemResultsEnhanceService = appInstance.lookup('service:item-results/enhance');

  // TypeScript thinks that `require` is `NodeRequire`
  // We need to ignore it to access `entries` on it.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  Object.keys(require.entries)
    .filter((moduleName) => moduleName.startsWith('better-trading/services/item-results/enhancers/'))
    .map((moduleName) => moduleName.replace('better-trading/services/', ''))
    .forEach((moduleName) => {
      itemResultsEnhanceService.registerEnhancerService(appInstance.lookup(`service:${moduleName}`));
    });
};

export default {
  initialize,
};
