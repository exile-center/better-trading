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

  const setupFakeTrades = (tradesByFolderId: Record<string, Array<Partial<BookmarksTradeStruct>>>): void => {
    const fakeFolders: BookmarksFolderStruct[] = Object.keys(tradesByFolderId).map((id) => ({
      id,
      title: `Title ${id}`,
      version: '1',
      icon: null,
      archivedAt: id.startsWith('archived') ? 'some timestamp' : null,
    }));
    bookmarksStorageMock.expects('fetchFolders').once().returns(Promise.resolve(fakeFolders));
  };

  describe('fetchTradeByLocation', () => {
    const setupFakeTradesForFetchByLocation = (
      tradesByFolderId: Record<string, Array<Partial<BookmarksTradeStruct>>>
    ): void => {
      setupFakeTrades(tradesByFolderId);

      for (const fakeFolderId in tradesByFolderId) {
        bookmarksStorageMock
          .expects('fetchTradesByFolderId')
          .once()
          .withArgs(fakeFolderId)
          .returns(Promise.resolve(tradesByFolderId[fakeFolderId]));
      }
    };

    it('should return null if no trade matches the given location', async () => {
      setupFakeTradesForFetchByLocation({});

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'unknown-slug'});

      expect(result).to.be.null;
    });

    it('should return corresponding trade when a single match exists', async () => {
      setupFakeTradesForFetchByLocation({
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
      setupFakeTradesForFetchByLocation({
        folder1: [
          {
            id: 'matching-id-1',
            title: 'alphabetically later',
            location: {version: '1', type: 'search', slug: 'matching-slug'},
          },
          {
            id: 'unrelated-id',
            title: 'aaalphabetically earliest, but wrong location',
            location: {version: '1', type: 'search', slug: 'unrelated-slug'},
          },
        ],
        folder2: [
          {
            id: 'matching-id-2',
            title: 'alphabetically earlier',
            location: {version: '1', type: 'search', slug: 'matching-slug'},
          },
        ],
      });

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'matching-slug'});

      expect(result).not.to.be.null;
      if (!result) return;
      expect(result.id).to.equal('matching-id-2');
      expect(result.title).to.equal('alphabetically earlier');
    });

    it('should prefer unarchived trades to archived ones', async () => {
      setupFakeTradesForFetchByLocation({
        'archived-folder': [
          {id: 'archived-trade', title: 'Archived Trade', location: {version: '1', type: 'search', slug: 'slug1'}},
        ],
        'current-folder': [
          {id: 'current-trade', title: 'Current Trade', location: {version: '1', type: 'search', slug: 'slug1'}},
        ],
      });

      const result = await service.fetchTradeByLocation({version: '1', type: 'search', slug: 'slug1'});

      expect(result).not.to.be.null;
      if (!result) return;
      expect(result.id).to.equal('current-trade');
      expect(result.title).to.equal('Current Trade');
    });
  });

  describe('partiallyReorderFolders', () => {
    it('should reorder all folders if given the entire allFolders array', async () => {
      setupFakeTrades({
        folder0: [],
        folder1: [],
        folder2: [],
      });
      const folders = await service.fetchFolders();
      const result = service.partiallyReorderFolders(folders, [folders[1], folders[0], folders[2]]);

      expect(result).to.deep.equal([folders[1], folders[0], folders[2]]);
    });

    it('should no-op if given an empty reorderedFolders array', async () => {
      setupFakeTrades({
        folder0: [],
        folder1: [],
        folder2: [],
      });
      const folders = await service.fetchFolders();
      const result = service.partiallyReorderFolders(folders, []);

      expect(result).to.deep.equal(folders);
    });

    it('should reorder only the folders that are in the reorderedFolders array', async () => {
      setupFakeTrades({
        folder0: [],
        folder1: [],
        folder2: [],
        folder3: [],
      });
      const folders = await service.fetchFolders();
      const result = service.partiallyReorderFolders(folders, [folders[2], folders[1]]);

      expect(result).to.deep.equal([folders[0], folders[2], folders[1], folders[3]]);
    });

    it('should throw an error if the reorderedFolders array is not a subset of the allFolders array', async () => {
      setupFakeTrades({
        folder0: [],
        folder1: [],
        folder2: [],
      });
      const folders = await service.fetchFolders();
      expect(() =>
        service.partiallyReorderFolders(folders, [
          folders[1],
          {id: '4', title: 'Folder 4', version: '1', icon: null, archivedAt: null},
        ])
      ).to.throw();
    });
  });
});
