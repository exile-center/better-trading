// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {afterEach, beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

describe('Unit | Services | Bookmarks', () => {
  setupTest();

  let service: Bookmarks;
  let bookmarksStorageMock: sinon.SinonMock;

  beforeEach(function () {
    service = this.owner.lookup('service:bookmarks');
    bookmarksStorageMock = sinon.mock(service.bookmarksStorage);
  });

  afterEach(() => {
    bookmarksStorageMock.verify();
  });

  describe('fetchTradeByLocation', () => {
    const setupFakeTrades = (tradesByFolderId: Record<string, Array<Partial<BookmarksTradeStruct>>>): void => {
      const fakeFolders: BookmarksFolderStruct[] = Object.keys(tradesByFolderId).map((id) => ({
        id,
        title: `Title ${id}`,
        icon: null,
        archivedAt: id.startsWith('archived') ? 'some timestamp' : null,
      }));
      bookmarksStorageMock.expects('fetchFolders').once().returns(Promise.resolve(fakeFolders));

      for (const fakeFolderId in tradesByFolderId) {
        bookmarksStorageMock
          .expects('fetchTradesByFolderId')
          .once()
          .withArgs(fakeFolderId)
          .returns(Promise.resolve(tradesByFolderId[fakeFolderId]));
      }
    };

    it('should return null if no trade matches the given location', async () => {
      setupFakeTrades({});

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'unknown-slug'});

      expect(result).to.be.null;
    });

    it('should return corresponding trade when a single match exists', async () => {
      setupFakeTrades({
        folder1: [
          {id: 'trade1', title: 'Trade 1', location: {version: '1', type: 'search', slug: 'slug1'}},
          {id: 'trade2', title: 'Trade 2', location: {version: '1', type: 'search', slug: 'slug2'}},
          {id: 'trade3', title: 'Trade 3', location: {version: '2', type: 'search', slug: 'slug1'}},
        ],
      });

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'slug1'});

      expect(result).not.to.be.null;
      if (!result) return;
      expect(result.id).to.equal('trade1');
      expect(result.title).to.equal('Trade 1');
    });

    it('should return trade with alphabetically first title when multiple matches exists', async () => {
      setupFakeTrades({
        folder1: [
          {id: 'matching-id-1', title: 'alphabetically later', location: {version: '1', type: 'search', slug: 'matching-slug'}},
          {
            id: 'unrelated-id',
            title: 'aaalphabetically earliest, but wrong location',
            location: {version: '1', type: 'search', slug: 'unrelated-slug'},
          },
        ],
        folder2: [
          {id: 'matching-id-2', title: 'alphabetically earlier', location: {version: '1', type: 'search', slug: 'matching-slug'}},
        ],
      });

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'matching-slug'});

      expect(result).not.to.be.null;
      if (!result) return;
      expect(result.id).to.equal('matching-id-2');
      expect(result.title).to.equal('alphabetically earlier');
    });

    it('should prefer unarchived trades to archived ones', async () => {
      setupFakeTrades({
        'archived-folder': [{id: 'archived-trade', title: 'Archived Trade', location: {version: '1', type: 'search', slug: 'slug1'}}],
        'current-folder': [{id: 'current-trade', title: 'Current Trade', location: {version: '1', type: 'search', slug: 'slug1'}}],
      });

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'slug1'});

      expect(result).not.to.be.null;
      if (!result) return;
      expect(result.id).to.equal('current-trade');
      expect(result.title).to.equal('Current Trade');
    });
  });
});
