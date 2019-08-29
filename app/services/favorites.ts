// Vendor
import {A} from '@ember/array';
import Service, {inject as service} from '@ember/service';

// Types
import MutableArray from '@ember/array/mutable';
import LocalStorage from 'better-trading/services/local-storage';
import {
  FavoritesFolder,
  FavoritesItem,
  FavoritesTrade,
  RawFavoritesFolder,
  RawFavoritesItem,
  RawFavoritesTrade
} from 'better-trading/types/favorites';

export default class Favorites extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  fetch(): MutableArray<FavoritesItem> {
    const rawFavorites = this.localStorage.getValue('favorites');
    if (!rawFavorites) return A([]);

    return A(
      JSON.parse(rawFavorites).map((rawItem: RawFavoritesItem) =>
        this._parseItem(rawItem)
      )
    );
  }

  persist(items: MutableArray<FavoritesItem>): void {
    this.localStorage.setValue('favorites', JSON.stringify(items));
  }

  forEachItem(items: MutableArray<FavoritesItem>, callback: (item: FavoritesItem) => void): void {
    items.forEach((item) => {
      callback(item);

      const potentialFolder = item as FavoritesFolder;
      if (!potentialFolder.items) return;
      this.forEachItem(potentialFolder.items, callback);
    })
  }

  forEachFolder(items: MutableArray<FavoritesItem>, callback: (folder: FavoritesFolder) => void): void {
    this.forEachItem(items, (item: FavoritesItem) => {
      const potentialFolder = item as FavoritesFolder;
      if (!potentialFolder.items) return;

      callback(potentialFolder);
    });
  }

  _parseItem(rawItem: RawFavoritesItem): FavoritesItem {
    if ((rawItem as RawFavoritesTrade).slug) return rawItem as FavoritesTrade;

    return {
      isExpanded: (rawItem as RawFavoritesFolder).isExpanded,
      items: A(
        (rawItem as RawFavoritesFolder).items.map(
          (subRawItem: RawFavoritesItem) => this._parseItem(subRawItem)
        )
      ),
      title: rawItem.title
    };
  }
}

declare module '@ember/service' {
  interface Registry {
    favorites: Favorites;
  }
}
