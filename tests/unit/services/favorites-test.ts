// Vendor
import {A} from '@ember/array';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import Favorites from 'better-trading/services/favorites';
import {FavoritesFolder, FavoritesTrade} from 'better-trading/types/favorites';

describe('Unit | Services | Favorites', () => {
  setupTest();

  let service: Favorites;
  let localStorageMock: sinon.SinonMock;

  beforeEach(function() {
    service = this.owner.lookup('service:favorites');
    localStorageMock = sinon.mock(service.localStorage);
  });

  afterEach(() => {
    localStorageMock.verify();
  });

  describe('fetch', () => {
    it('should returns an empty Ember array for a blank state', () => {
      localStorageMock
        .expects('getValue')
        .withArgs('favorites')
        .once()
        .returns(null);

      const resolvedItems = service.fetch();

      expect(resolvedItems).to.be.empty;
    });

    it('should returns the tree structure with Ember arrays', () => {
      localStorageMock
        .expects('getValue')
        .withArgs('favorites')
        .once()
        .returns(
          JSON.stringify([
            {
              isExpanded: true,
              items: [{slug: 'some-slug', title: 'Some slug'}],
              title: 'Foo'
            }
          ])
        );

      const resolvedItems = service.fetch();

      expect(resolvedItems).to.have.lengthOf(1);

      const firstRootFolder = (resolvedItems.firstObject as unknown) as FavoritesFolder;
      expect(firstRootFolder.title).to.equal('Foo');
      expect(firstRootFolder.items).to.have.lengthOf(1);

      const subTradeItem: FavoritesTrade = (firstRootFolder.items
        .firstObject as unknown) as FavoritesTrade;
      expect(subTradeItem.slug).to.equal('some-slug');
    });
  });

  describe('persist', () => {
    it('should persist the tree structure in the localStorage using JSON', () => {
      localStorageMock
        .expects('setValue')
        .once()
        .withArgs(
          'favorites',
          '[{"isExpanded":true,"items":[{"slug":"some-slug","title":"Some slug"}],"title":"Foo"}]'
        );

      service.persist(
        A([
          {
            isExpanded: true,
            items: A([{slug: 'some-slug', title: 'Some slug'}]),
            title: 'Foo'
          }
        ])
      );
    });
  });
});
