// Vendors
import Component from '@ember/component';
import {action, set} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import MutableArray from '@ember/array/mutable';
import Favorites from 'better-trading/services/favorites';
import LocalStorage from 'better-trading/services/local-storage';
import {FavoritesFolder, FavoritesItem} from 'better-trading/types/favorites';

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
  persist(): void {
    this.favorites.persist(this.items);
  }

  @action
  move({sourceList, sourceIndex, targetList, targetIndex}: MoveActionParams) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const item = sourceList.objectAt(sourceIndex);
    if (!item) return;

    sourceList.removeAt(sourceIndex);
    targetList.insertAt(targetIndex, item);

    this.persist();
  }

  @action
  deleteAt(index: number) {
    this.items.removeAt(index);
    this.persist();
  }

  @action
  collapseAllFolders() {
    this.favorites.forEachFolder(this.items, (folder: FavoritesFolder) => {
      set(folder, 'isExpanded', false);
    });

    this.persist();
  }

  @action
  createRootFolder() {
    this.items.unshiftObject(this.favorites.createEmptyFolder());

    this.persist();
  }
}
