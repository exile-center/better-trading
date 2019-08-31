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
import IntlService from 'ember-intl/services/intl';

// Constants
const BUILD_FOLDER_TITLE_KEYS = [
  'services.favorites.build.body_armor',
  'services.favorites.build.weapon_shield',
  'services.favorites.build.helmet_gloves',
  'services.favorites.build.boots_belt',
  'services.favorites.build.rings_amulet',
  'services.favorites.build.jewels',
  'services.favorites.build.flasks'
];

export default class Favorites extends Service {
  @service('intl')
  intl: IntlService;

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

  forEachItem(
    items: MutableArray<FavoritesItem>,
    callback: (item: FavoritesItem) => void
  ): void {
    items.forEach(item => {
      callback(item);

      const potentialFolder = item as FavoritesFolder;
      if (!potentialFolder.items) return;
      this.forEachItem(potentialFolder.items, callback);
    });
  }

  forEachFolder(
    items: MutableArray<FavoritesItem>,
    callback: (folder: FavoritesFolder) => void
  ): void {
    this.forEachItem(items, (item: FavoritesItem) => {
      const potentialFolder = item as FavoritesFolder;
      if (!potentialFolder.items) return;

      callback(potentialFolder);
    });
  }

  createTrade(slug: string, title: string): FavoritesItem {
    return {slug, title};
  }

  createEmptyFolder(title?: string): FavoritesFolder {
    return {
      isExpanded: true,
      items: A([]),
      title: title || ''
    };
  }

  createBuildFolder(): FavoritesFolder {
    return {
      isExpanded: true,
      items: A(
        BUILD_FOLDER_TITLE_KEYS.map((titleKey: string) => ({
          isExpanded: false,
          items: A([]),
          title: this.intl.t(titleKey)
        }))
      ),
      title: ''
    };
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
