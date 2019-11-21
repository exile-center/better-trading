// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {default as window, reset} from 'ember-window-mock';
import {beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import Location from 'better-trading/services/location';

describe('Unit | Services | Trade location', () => {
  setupTest();

  let service: Location;

  beforeEach(function() {
    reset();
    service = this.owner.lookup('service:trade-location');
  });

  describe('get league', () => {
    it('should returns the active league from the base URL', () => {
      window.location.pathname = '/trade/search/Legion';

      expect(service.league).to.equal('Legion');
    });

    it('should returns the active league from a trade URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5';

      expect(service.league).to.equal('Legion');
    });

    it('should returns the active league from a bulk exchange URL', () => {
      window.location.pathname = '/trade/exchange/Legion/q1w2e3r4t5';

      expect(service.league).to.equal('Legion');
    });
  });

  describe('get slug', () => {
    it('should handle the absence of a current trade', () => {
      window.location.pathname = '/trade/search/Legion';

      expect(service.slug).to.be.null;
    });

    it('should returns the active trade slug from a trade URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5';

      expect(service.slug).to.equal('q1w2e3r4t5');
    });

    it('should returns the active trade slug from a bulk exchange URL', () => {
      window.location.pathname = '/trade/exchange/Legion/q1w2e3r4t5';

      expect(service.slug).to.equal('q1w2e3r4t5');
    });
  });

  describe('navigateToTrade', () => {
    it('should forge the proper URL and redirect to it', () => {
      const replaceSpy = sinon.spy();
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5';
      window.location.replace = replaceSpy;

      service.navigateToTrade('foobar');

      expect(replaceSpy).to.have.been.calledOnceWith('https://www.pathofexile.com/trade/search/Legion/foobar');
    });
  });
});
