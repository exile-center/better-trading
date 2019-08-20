// Vendors
import Component from '@ember/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import MutableArray from '@ember/array/mutable';
import Favorites from 'better-trading/services/favorites';
import LocalStorage from 'better-trading/services/local-storage';
import {FavoritesItem} from 'better-trading/types/favorites';

interface MoveActionParams {
  sourceList: MutableArray<FavoritesItem>;
  sourceIndex: number;
  targetList: MutableArray<FavoritesItem>;
  targetIndex: number;
}

export default class BtFavoritesTree extends Component {
  @service('favorites')
  favorites: Favorites;

  @service('local-storage')
  localStorage: LocalStorage;

  items: MutableArray<FavoritesItem>;

  willInsertElement(): void {
    this.items = this.favorites.fetch();
  }

  @action
  persistFavorites(): void {
    this.favorites.persist(this.items);
  }

  @action
  moveItem({
    sourceList,
    sourceIndex,
    targetList,
    targetIndex
  }: MoveActionParams) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const item = sourceList.objectAt(sourceIndex);
    if (!item) return;

    sourceList.removeAt(sourceIndex);
    targetList.insertAt(targetIndex, item);

    this.persistFavorites();
  }
}
