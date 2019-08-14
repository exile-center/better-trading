// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import LocalStorage from 'better-trading/services/local-storage';

describe('Unit | Services | Local storage', () => {
  setupTest();

  let service: LocalStorage;
  let localStorageSetItemStub: sinon.SinonStub;
  let localStorageGetItemStub: sinon.SinonStub;

  beforeEach(function() {
    service = this.owner.lookup('service:local-storage');

    localStorageSetItemStub = sinon.stub();
    localStorageGetItemStub = sinon.stub();

    service.localStorage = {
      getItem: localStorageGetItemStub,
      setItem: localStorageSetItemStub
    };
  });

  describe('setValue', () => {
    it('should set the value with the proper prefix', () => {
      service.setValue('favorites', 'foobar');

      expect(localStorageSetItemStub).to.have.been.calledOnceWith(
        'bt-favorites',
        'foobar'
      );
    });
  });

  describe('setEphemeralValue', () => {
    it('should set the value and the expiry timestamp', () => {
      const currentTimestamp = new Date().getTime();
      service.setEphemeralValue('favorites', 'foobar', 10000);

      expect(localStorageSetItemStub.firstCall).to.have.been.calledWith(
        'bt-favorites',
        'foobar'
      );

      const [expiryKey, expiryValue] = localStorageSetItemStub.secondCall.args;
      expect(expiryKey).to.equal('bt-favorites--expires-at');
      expect(parseInt(expiryValue, 10)).to.be.greaterThan(currentTimestamp);
    });
  });

  describe('getValue', () => {
    it('should returns the stored value', () => {
      localStorageGetItemStub.withArgs('bt-favorites').returns('foobar');

      expect(service.getValue('favorites')).to.equal('foobar');
    });

    it('should returns the unexpired ephemeral value', () => {
      localStorageGetItemStub.withArgs('bt-favorites').returns('foobar');
      localStorageGetItemStub
        .withArgs('bt-favorites--expires-at')
        .returns((new Date().getTime() + 10000).toString());

      expect(service.getValue('favorites')).to.equal('foobar');
    });

    it('should returns null for an expired ephemeral value', () => {
      localStorageGetItemStub.withArgs('bt-favorites').returns('foobar');
      localStorageGetItemStub
        .withArgs('bt-favorites--expires-at')
        .returns((new Date().getTime() - 10000).toString());

      expect(service.getValue('favorites')).to.be.null;
    });
  });
});
