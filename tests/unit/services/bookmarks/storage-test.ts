// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, afterEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Fixtures
import fakeBookmarkFolder from 'better-trading/tests/fixtures/bookmark-folder';
import fakeBookmarkTrade from 'better-trading/tests/fixtures/bookmark-trade';

// Types
import BookmarksStorage from 'better-trading/services/bookmarks/storage';

describe('Unit | Services | Bookmarks | Storage', () => {
  setupTest();

  let service: BookmarksStorage;
  let storageMock: sinon.SinonMock;

  beforeEach(function () {
    service = this.owner.lookup('service:bookmarks/storage');
    storageMock = sinon.mock(service.storage);
  });

  afterEach(() => {
    storageMock.verify();
  });

  describe('fetchFolders', () => {
    it('should returns an empty array when there is no folders', async () => {
      storageMock.expects('getValue').once().withArgs('bookmark-folders').returns(Promise.resolve(null));

      const folders = await service.fetchFolders();

      expect(folders).to.have.same.members([]);
    });

    it('should returns the folders when there is any', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('bookmark-folders')
        .returns(
          Promise.resolve([fakeBookmarkFolder({title: 'First folder'}), fakeBookmarkFolder({title: 'Second folder'})])
        );

      const folders = await service.fetchFolders();

      expect(folders.length).to.be.equal(2);
      expect(folders[0].title).to.be.equal('First folder');
      expect(folders[1].title).to.be.equal('Second folder');
    });
  });

  describe('fetchTradesByFolderId', () => {
    it('should returns an empty array when there is no trades', async () => {
      storageMock.expects('getValue').once().withArgs('bookmark-trades--fake-folder').returns(Promise.resolve(null));

      const trades = await service.fetchTradesByFolderId('fake-folder');

      expect(trades).to.have.same.members([]);
    });

    it('should returns the trades when there is any', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('bookmark-trades--fake-folder')
        .returns(
          Promise.resolve([fakeBookmarkTrade({title: 'First trade'}), fakeBookmarkTrade({title: 'Second trade'})])
        );

      const trades = await service.fetchTradesByFolderId('fake-folder');

      expect(trades.length).to.be.equal(2);
      expect(trades[0].title).to.be.equal('First trade');
      expect(trades[1].title).to.be.equal('Second trade');
    });
  });

  describe('persistFolder', () => {
    it('should add a new folder if it is a new one', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('bookmark-folders')
        .returns(Promise.resolve([fakeBookmarkFolder({title: 'Existing folder'})]));

      const receivedSetValue = storageMock.expects('setValue').once().returns(Promise.resolve());

      await service.persistFolder(fakeBookmarkFolder(fakeBookmarkFolder({title: 'New folder', id: undefined})));

      const [[storageKey, persistedFolders]] = receivedSetValue.args;
      expect(storageKey).to.be.equal('bookmark-folders');
      expect(persistedFolders.length).to.be.equal(2);
      expect(persistedFolders[0].title).to.be.equal('Existing folder');
      expect(persistedFolders[1].title).to.be.equal('New folder');
      expect(persistedFolders[1].id).to.match(/.+/);
    });

    it('should persist in-place a folder if it already exists', async () => {
      const folder = fakeBookmarkFolder({title: 'Existing folder'});

      storageMock
        .expects('getValue')
        .once()
        .withArgs('bookmark-folders')
        .returns(Promise.resolve([folder]));

      const receivedSetValue = storageMock.expects('setValue').once().returns(Promise.resolve());

      await service.persistFolder({
        ...folder,
        title: 'Updated title',
      });

      const [[storageKey, persistedFolders]] = receivedSetValue.args;
      expect(storageKey).to.be.equal('bookmark-folders');
      expect(persistedFolders.length).to.be.equal(1);
      expect(persistedFolders[0].title).to.be.equal('Updated title');
      expect(persistedFolders[0].id).to.be.equal(folder.id);
    });
  });

  describe('deleteFolder', () => {
    it('should remove the folder from the list and remove its trades', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('bookmark-folders')
        .returns(Promise.resolve([fakeBookmarkFolder({id: 'fake-folder', title: 'Existing folder'})]));

      storageMock.expects('setValue').once().withArgs('bookmark-folders', []).returns(Promise.resolve());

      storageMock.expects('deleteValue').once().withArgs('bookmark-trades--fake-folder').returns(Promise.resolve());

      await service.deleteFolder('fake-folder');
    });
  });

  describe('deleteTrade', () => {
    it('should remove the trade from the list', async () => {
      storageMock
        .expects('getValue')
        .once()
        .withArgs('bookmark-trades--fake-folder')
        .returns(Promise.resolve([fakeBookmarkTrade({id: 'fake-trade'})]));

      storageMock.expects('setValue').once().withArgs('bookmark-trades--fake-folder', []).returns(Promise.resolve());

      await service.deleteTrade('fake-trade', 'fake-folder');
    });
  });
});
