// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {afterEach, beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import PageTitle from 'better-trading/services/page-title';
import TradeLocation from 'better-trading/services/trade-location';
import {ExactTradeLocationStruct} from 'better-trading/types/trade-location';

describe('Unit | Services | PageTitle', () => {
  setupTest();

  let service: PageTitle;
  let bookmarksMock: sinon.SinonMock;
  let searchPanelMock: sinon.SinonMock;
  let currentLocationStub: Partial<ExactTradeLocationStruct>;

  beforeEach(function () {
    service = this.owner.lookup('service:page-title');
    service.baseSiteTitle = 'Base Site Title';
    bookmarksMock = sinon.mock(service.bookmarks);
    searchPanelMock = sinon.mock(service.searchPanel);
    currentLocationStub = {type: null};
    service.tradeLocation = {currentTradeLocation: currentLocationStub} as TradeLocation;
  });

  afterEach(() => {
    bookmarksMock.verify();
    searchPanelMock.verify();
  });

  describe('calculateTitle', () => {
    it('adds a ⚡ prefix to live searches', async () => {
      currentLocationStub.type = 'search';
      currentLocationStub.isLive = true;

      bookmarksMock.expects('fetchTradeByLocation').once().returns(Promise.resolve(null));
      searchPanelMock.expects('recommendTitle').once().returns('');

      await service.recalculateTradeTitleSegment();

      expect(document.title).to.equal('⚡ Base Site Title');
    });

    it('uses the current bookmark title if available', async () => {
      currentLocationStub.type = 'search';
      currentLocationStub.isLive = false;

      bookmarksMock
        .expects('fetchTradeByLocation')
        .once()
        .withArgs(currentLocationStub)
        .returns(Promise.resolve({title: 'Bookmark Title'}));
      searchPanelMock.expects('recommendTitle').never();

      await service.recalculateTradeTitleSegment();

      expect(document.title).to.equal('Bookmark Title - Base Site Title');
    });

    it('uses the search panel recommended title if there is no current bookmark', async () => {
      currentLocationStub.type = 'search';
      currentLocationStub.isLive = false;

      bookmarksMock.expects('fetchTradeByLocation').once().withArgs(currentLocationStub).returns(Promise.resolve(null));
      searchPanelMock.expects('recommendTitle').once().returns('Search Panel Recommendation');

      await service.recalculateTradeTitleSegment();

      expect(document.title).to.equal('Search Panel Recommendation - Base Site Title');
    });

    it('falls back to the base site title', async () => {
      currentLocationStub.type = 'search';
      currentLocationStub.isLive = false;

      bookmarksMock.expects('fetchTradeByLocation').once().withArgs(currentLocationStub).returns(Promise.resolve(null));
      searchPanelMock.expects('recommendTitle').once().returns('');

      await service.recalculateTradeTitleSegment();

      expect(document.title).to.equal('Base Site Title');
    });

    it('does not query the search panel for non-search locations', async () => {
      currentLocationStub.type = 'exchange';
      currentLocationStub.isLive = false;

      bookmarksMock.expects('fetchTradeByLocation').once().withArgs(currentLocationStub).returns(Promise.resolve(null));
      searchPanelMock.expects('recommendTitle').never();

      await service.recalculateTradeTitleSegment();

      expect(document.title).to.equal('Base Site Title');
    });

    it('reflects woop counts if base site updates title as "(count) base title"', async () => {
      currentLocationStub.type = 'search';
      currentLocationStub.isLive = true;

      bookmarksMock.expects('fetchTradeByLocation').once().withArgs(currentLocationStub).returns(Promise.resolve(null));
      searchPanelMock.expects('recommendTitle').once().returns('Search Panel Recommendation');

      await service.recalculateTradeTitleSegment();

      document.title = '(32) Base Site Title';
      service.onDocumentTitleMutation();
      expect(document.title).to.equal('(32) ⚡ Search Panel Recommendation - Base Site Title');

      document.title = 'Base Site Title';
      service.onDocumentTitleMutation();

      expect(document.title).to.equal('⚡ Search Panel Recommendation - Base Site Title');
    });

    it('reflects woop counts if base site updates title by prepending "(count) " prefix to our title"', async () => {
      currentLocationStub.type = 'search';
      currentLocationStub.isLive = true;

      bookmarksMock.expects('fetchTradeByLocation').once().withArgs(currentLocationStub).returns(Promise.resolve(null));
      searchPanelMock.expects('recommendTitle').once().returns('Search Panel Recommendation');

      await service.recalculateTradeTitleSegment();

      document.title = '(32) ⚡ Search Panel Recommendation - Base Site Title';
      service.onDocumentTitleMutation();
      expect(document.title).to.equal('(32) ⚡ Search Panel Recommendation - Base Site Title');

      document.title = 'Base Site Title';
      service.onDocumentTitleMutation();

      expect(document.title).to.equal('⚡ Search Panel Recommendation - Base Site Title');
    });
  });
});
