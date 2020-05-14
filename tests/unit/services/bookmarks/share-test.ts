// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, describe, it} from 'mocha';

// Fixtures
import fakeBookmarkFolder from 'better-trading/tests/fixtures/bookmark-folder';
import fakeBookmarkTrade from 'better-trading/tests/fixtures/bookmark-trade';

// Types
import BookmarksShare from 'better-trading/services/bookmarks/share';

describe('Unit | Services | Bookmarks | Share', () => {
  setupTest();

  let service: BookmarksShare;

  beforeEach(function() {
    service = this.owner.lookup('service:bookmarks/share');
  });

  describe('serialize/deserialize', () => {
    it('should be able to encode and decode back a folder and its trades', () => {
      const folder = fakeBookmarkFolder({
        title: 'Some folder'
      });

      const trade = fakeBookmarkTrade({
        title: 'Some trade'
      });

      const encoded = service.serialize(folder, [trade]);
      expect(encoded).to.be.a('string');

      const decoded = service.deserialize(encoded);
      expect(decoded).to.not.be.null;

      if (!decoded) return;
      const [decodedFolder, decodedTrades] = decoded;
      expect(decodedFolder.title).to.be.equal(folder.title);
      expect(decodedTrades[0].title).to.be.equal(trade.title);
    });
  });

  describe('deserialize', () => {
    it('should return null for invalid input', () => {
      expect(service.deserialize('foobar')).to.be.null;
      expect(
        service.deserialize(
          btoa(
            JSON.stringify({
              title: 'incomplete payload'
            })
          )
        )
      ).to.be.null;
    });
  });
});
