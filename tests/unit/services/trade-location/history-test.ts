// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, afterEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Fixtures
import fakeTradeLocationHistory from 'better-trading/tests/fixtures/trade-location-history';

// Types
import TradeLocationHistory from 'better-trading/services/trade-location/history';

describe('Unit | Services | TradeLocation | History', () => {
  setupTest();

  let service: TradeLocationHistory;
  let storageMock: sinon.SinonMock;

  beforeEach(function() {
    service = this.owner.lookup('service:trade-location/history');
    storageMock = sinon.mock(service.storage);
  });

  afterEach(() => {
    storageMock.verify();
  });

  describe('maybeLogTradeLocation', () => {
    it('should not do anything if the location is not complete', async () => {
      storageMock.expects('getValue').never();

      storageMock.expects('setValue').never();

      await service.maybeLogTradeLocation({slug: null, league: 'foo', type: 'search'});
    });

    it('should not log it twice if it is identical to the last entry', async () => {
      storageMock
        .expects('getValue')
        .once()
        .returns(Promise.resolve([fakeTradeLocationHistory({slug: 'bang', league: 'foo', type: 'search'})]));

      storageMock.expects('setValue').never();

      await service.maybeLogTradeLocation({slug: 'bang', league: 'foo', type: 'search'});
    });

    it('should prepend a valid entry', async () => {
      storageMock
        .expects('getValue')
        .once()
        .returns(Promise.resolve([fakeTradeLocationHistory({slug: 'last-entry', league: 'foo', type: 'search'})]));

      const setValueCall = storageMock
        .expects('setValue')
        .once()
        .returns(Promise.resolve());

      await service.maybeLogTradeLocation({slug: 'bang', league: 'foo', type: 'search'});

      const [[storageKey, persistedEntries]] = setValueCall.args;
      expect(storageKey).to.be.equal('trade-history');
      expect(persistedEntries.length).to.be.equal(2);
      expect(persistedEntries[0].slug).to.be.equal('bang');
      expect(persistedEntries[1].slug).to.be.equal('last-entry');
    });

    it('should rotate the history if the maximum is reached', async () => {
      storageMock
        .expects('getValue')
        .once()
        .returns(
          Promise.resolve([
            fakeTradeLocationHistory({slug: '1'}),
            fakeTradeLocationHistory({slug: '2'}),
            fakeTradeLocationHistory({slug: '3'}),
            fakeTradeLocationHistory({slug: '4'}),
            fakeTradeLocationHistory({slug: 'will-overflow-5'}),
            fakeTradeLocationHistory({slug: 'will-overflow-6'}),
            fakeTradeLocationHistory({slug: 'will-overflow-7'})
          ])
        );

      const setValueCall = storageMock
        .expects('setValue')
        .once()
        .returns(Promise.resolve());

      await service.maybeLogTradeLocation({slug: '0', league: 'foo', type: 'search'});

      const [[storageKey, persistedEntries]] = setValueCall.args;
      expect(storageKey).to.be.equal('trade-history');
      expect(persistedEntries.length).to.be.equal(5);
      expect(persistedEntries[0].slug).to.be.equal('0');
      expect(persistedEntries[1].slug).to.be.equal('1');
      expect(persistedEntries[2].slug).to.be.equal('2');
      expect(persistedEntries[3].slug).to.be.equal('3');
      expect(persistedEntries[4].slug).to.be.equal('4');
    });
  });

  describe('fetchHistoryEntries', () => {
    it('should returns an empty array when there is no history', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('trade-history')
        .returns(Promise.resolve(null));

      const historyEntries = await service.fetchHistoryEntries();

      expect(historyEntries).to.have.same.members([]);
    });

    it('should returns the entries when there is any', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('trade-history')
        .returns(
          Promise.resolve([
            fakeTradeLocationHistory({title: 'First history'}),
            fakeTradeLocationHistory({title: 'Second history'})
          ])
        );

      const historyEntries = await service.fetchHistoryEntries();

      expect(historyEntries.length).to.be.equal(2);
      expect(historyEntries[0].title).to.be.equal('First history');
      expect(historyEntries[1].title).to.be.equal('Second history');
    });
  });
});
