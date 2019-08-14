// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {default as window, reset} from 'ember-window-mock';
import {beforeEach, describe, it} from 'mocha';

// Types
import LocalStorage from 'better-trading/services/local-storage';

describe('Unit | Services | Local storage', () => {
  setupTest();

  let service: LocalStorage;

  beforeEach(function() {
    reset();
    service = this.owner.lookup('service:local-storage');
  });

  describe('setValue', () => {
    it('should set the value with the proper prefix', () => {
      service.setValue('favorites', 'foobar');

      expect(window.localStorage.getItem('bt-favorites')).to.equal('foobar');
    });
  });

  describe('setEphemeralValue', () => {
    it('should set the value and the expiry timestamp', () => {
      const estimatedExpiryTimestamp = new Date().getTime() + 1000;
      service.setEphemeralValue('favorites', 'foobar', 1000);

      expect(window.localStorage.getItem('bt-favorites')).to.equal('foobar');

      const parsedExpiry = parseInt(
        window.localStorage.getItem('bt-favorites--expires-at') || '',
        10
      );
      expect(parsedExpiry).to.be.greaterThan(estimatedExpiryTimestamp - 500);
      expect(parsedExpiry).to.be.lessThan(estimatedExpiryTimestamp + 500);
    });
  });

  describe('getValue', () => {
    it('should returns the stored value', () => {
      window.localStorage.setItem('bt-favorites', 'foobar');

      expect(service.getValue('favorites')).to.equal('foobar');
    });

    it('should returns the unexpired ephemeral value', () => {
      window.localStorage.setItem('bt-favorites', 'foobar');
      window.localStorage.setItem(
        'bt-favorites--expires-at',
        (new Date().getTime() + 10000).toString()
      );

      expect(service.getValue('favorites')).to.equal('foobar');
    });

    it('should returns null for an expired ephemeral value', () => {
      window.localStorage.setItem('bt-favorites', 'foobar');
      window.localStorage.setItem(
        'bt-favorites--expires-at',
        (new Date().getTime() - 10000).toString()
      );

      expect(service.getValue('favorites')).to.be.null;
    });
  });
});
