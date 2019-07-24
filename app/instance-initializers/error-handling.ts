/* istanbul ignore file */

// Vendor
import Ember from 'ember';

// Constants
import internalErrorPage from 'ember-boilerplate/error-pages/internal-error-page';

// Types
import ApplicationInstance from '@ember/application/instance';
import FastBoot from 'ember-cli-fastboot/services/fastboot';

const INTERNAL_ERROR_STATUS = 500;

export const initialize = (application: ApplicationInstance): void => {
  Ember.onerror = error => {
    const fastboot: FastBoot = application.lookup('service:fastboot');

    if (fastboot.isFastBoot) {
      fastboot.response.statusCode = INTERNAL_ERROR_STATUS;
    } else {
      // tslint:disable-next-line no-non-null-assertion
      document.querySelector('html')!.innerHTML = internalErrorPage(
        error.stack || error
      ).trim();
    }
  };
};

export default {
  initialize,
  name: 'fastboot-error-handling'
};
