// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {default as window, reset} from 'ember-window-mock';
import {beforeEach, afterEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import {Task} from 'better-trading/types/ember-concurrency';
import delay from 'better-trading/tests/helpers/delay';

describe('Unit | Services | TradeLocation', () => {
  setupTest();

  let service: TradeLocation;
  let tradeLocationHistoryMock: sinon.SinonMock;

  beforeEach(function () {
    window.location.pathname = '/trade/search/initial-league/initial-trade';
    service = this.owner.lookup('service:trade-location');
    tradeLocationHistoryMock = sinon.mock(service.tradeLocationHistory);
  });

  afterEach(() => {
    reset();
    tradeLocationHistoryMock.verify();
  });

  describe('get version', () => {
    it('should return 1 from the base URL', () => {
      window.location.pathname = '/trade/search/Legion';

      expect(service.version).to.equal('1');
    });

    it('should return 2 from the base URL', () => {
      window.location.pathname = '/trade2/search/poe2/Standard';

      expect(service.version).to.equal('2');
    });
  });

  describe('get type', () => {
    it('should return null from the unresolved redirect URL', () => {
      window.location.pathname = '/trade';

      expect(service.type).to.be.null;
    });

    it('should return search from the base URL', () => {
      window.location.pathname = '/trade/search/Legion';

      expect(service.type).to.equal('search');
    });

    it('should return search from a trade URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5';

      expect(service.type).to.equal('search');
    });

    it('should return exchange from a bulk exchange URL', () => {
      window.location.pathname = '/trade/exchange/Legion/q1w2e3r4t5';

      expect(service.type).to.equal('exchange');
    });

    it('should return search from a live search URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5/live';

      expect(service.type).to.equal('search');
    });
  });

  describe('get isLive', () => {
    it('should return false from the base URL', () => {
      window.location.pathname = '/trade/search/Legion';

      expect(service.isLive).to.be.false;
    });

    it('should return false from a trade URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5';

      expect(service.isLive).to.be.false;
    });

    it('should return false from a bulk exchange URL', () => {
      window.location.pathname = '/trade/exchange/Legion/q1w2e3r4t5';

      expect(service.isLive).to.be.false;
    });

    it('should return true from a live search URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5/live';

      expect(service.isLive).to.be.true;
    });
  });

  describe('get league (PC realm)', () => {
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

    it('should returns the active league from a live search URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5/live';

      expect(service.league).to.equal('Legion');
    });
  });

  describe('get league (non-PC realm)', () => {
    it('should returns the active league from the base URL', () => {
      window.location.pathname = '/trade/search/xbox/Legion';

      expect(service.league).to.equal('xbox/Legion');
    });

    it('should returns the active league from a trade URL', () => {
      window.location.pathname = '/trade/search/sony/Legion/q1w2e3r4t5';

      expect(service.league).to.equal('sony/Legion');
    });

    it('should returns the active league from a bulk exchange URL', () => {
      window.location.pathname = '/trade/exchange/xbox/Legion/q1w2e3r4t5';

      expect(service.league).to.equal('xbox/Legion');
    });

    it('should returns the active league from a live search URL', () => {
      window.location.pathname = '/trade/search/sony/Legion/q1w2e3r4t5/live';

      expect(service.league).to.equal('sony/Legion');
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

    it('should returns the active trade slug from a live search URL', () => {
      window.location.pathname = '/trade/search/Legion/q1w2e3r4t5/live';

      expect(service.slug).to.equal('q1w2e3r4t5');
    });

    it('should returns the active trade slug from an Xbox realm trade URL', () => {
      window.location.pathname = '/trade/search/xbox/Legion/q1w2e3r4t5/live';

      expect(service.slug).to.equal('q1w2e3r4t5');
    });

    it('should returns the active trade slug from a Playstation realm live search URL', () => {
      window.location.pathname = '/trade/search/sony/Legion/q1w2e3r4t5/live';

      expect(service.slug).to.equal('q1w2e3r4t5');
    });
  });

  describe('getTradeUrl', () => {
    describe('for PoE 1', () => {
      it('should forge the proper URL', () => {
        expect(service.getTradeUrl('1', 'search', 'foobar', 'some-league')).to.be.equal(
          'https://www.pathofexile.com/trade/search/some-league/foobar'
        );
      });

      it('should support Xbox realm', () => {
        expect(service.getTradeUrl('1', 'search', 'foobar', 'xbox/some-league')).to.be.equal(
          'https://www.pathofexile.com/trade/search/xbox/some-league/foobar'
        );
      });

      it('should support Playstation realm', () => {
        expect(service.getTradeUrl('1', 'search', 'foobar', 'sony/some-league')).to.be.equal(
          'https://www.pathofexile.com/trade/search/sony/some-league/foobar'
        );
      });
    });

    describe('for PoE 2', () => {
      it('should forge the proper URL', () => {
        expect(service.getTradeUrl('2', 'search', 'foobar', 'poe2/Standard')).to.be.equal(
          'https://www.pathofexile.com/trade2/search/poe2/Standard/foobar'
        );
      });
    });
  });

  describe('locationPollingTask', () => {
    afterEach(() => {
      (service.locationPollingTask as Task).cancelAll();
    });

    describe(`when the location switches to a new trade`, () => {
      beforeEach(() => {
        window.location.pathname = '/trade/search/new-league/new-trade';
      });

      it('should fires the event and log the history change', async () => {
        tradeLocationHistoryMock
          .expects('maybeLogTradeLocation')
          .once()
          .withArgs({
            version: '1',
            type: 'search',
            slug: 'new-trade',
            league: 'new-league',
            isLive: false,
          })
          .returns(Promise.resolve());

        const changeSpy = sinon.spy();
        service.on('change', changeSpy);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (service.locationPollingTask as Task).perform();
        await delay(150);

        expect(changeSpy).to.have.been.calledOnceWith({
          oldTradeLocation: {
            version: '1',
            type: 'search',
            slug: 'initial-trade',
            league: 'initial-league',
            isLive: false,
          },
          newTradeLocation: {
            version: '1',
            type: 'search',
            slug: 'new-trade',
            league: 'new-league',
            isLive: false,
          },
        });
      });
    });

    describe(`when the location toggles to live search mode`, () => {
      beforeEach(() => {
        window.location.pathname = '/trade/search/initial-league/initial-trade/live';
      });

      it('should fires the event and log the history change', async () => {
        // It's TradeLocationHistory's responsibility to ignore this case
        tradeLocationHistoryMock
          .expects('maybeLogTradeLocation')
          .once()
          .withArgs({
            version: '1',
            type: 'search',
            slug: 'initial-trade',
            league: 'initial-league',
            isLive: true,
          })
          .returns(Promise.resolve());

        const changeSpy = sinon.spy();
        service.on('change', changeSpy);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (service.locationPollingTask as Task).perform();
        await delay(150);

        expect(changeSpy).to.have.been.calledOnceWith({
          oldTradeLocation: {
            version: '1',
            type: 'search',
            slug: 'initial-trade',
            league: 'initial-league',
            isLive: false,
          },
          newTradeLocation: {
            version: '1',
            type: 'search',
            slug: 'initial-trade',
            league: 'initial-league',
            isLive: true,
          },
        });
      });
    });

    describe('when the location stays the same', () => {
      it('should not do anything', async () => {
        tradeLocationHistoryMock.expects('maybeLogTradeLocation').never();
        const changeSpy = sinon.spy();
        service.on('change', changeSpy);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (service.locationPollingTask as Task).perform();
        await delay(150);

        expect(changeSpy).to.not.have.been.called;
      });
    });
  });
});
