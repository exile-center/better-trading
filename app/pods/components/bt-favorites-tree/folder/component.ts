// Vendors
import Component from '@ember/component';
import {action, set} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import Favorites from 'better-trading/services/favorites';
import SearchPanel from 'better-trading/services/search-panel';
import TradeLocation from 'better-trading/services/trade-location';
import {FavoritesFolder} from 'better-trading/types/favorites';

export default class BtFavoritesTreeFolder extends Component {
  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('search-panel')
  searchPanel: SearchPanel;

  @service('favorites')
  favorites: Favorites;

  isEditing = false;

  folder: FavoritesFolder;
  onUpdate: () => void;
  onMove: () => void;
  onDelete: () => void;

  @action
  toggleExpanded() {
    if (this.folder.isExpanded) {
      this._collapseFolderAndSubfolders();
    } else {
      this._expandFolder();
    }

    this.onUpdate();
  }

  @action
  createFolder() {
    this.folder.items.unshiftObject(this.favorites.createEmptyFolder());

    this.onUpdate();
  }

  @action
  createTrade() {
    if (!this.tradeLocation.slug) return;
    this.folder.items.unshiftObject(
      this.favorites.createTrade(
        this.tradeLocation.slug,
        this.searchPanel.recommendTitle()
      )
    );

    this.onUpdate();
  }

  @action
  deleteAt(index: number) {
    this.folder.items.removeAt(index);
    this.onUpdate();
  }

  @action
  startEditing() {
    this.set('isEditing', true);
  }

  @action
  stopEditing() {
    this.set('isEditing', false);
  }

  @action
  updateTitle(newTitle: string) {
    set(this.folder, 'title', newTitle);
    this.set('isEditing', false);
    this.onUpdate();
  }

  _collapseFolderAndSubfolders() {
    if (this.folder.isExpanded) set(this.folder, 'isExpanded', false);

    this.favorites.forEachFolder(
      this.folder.items,
      (subfolder: FavoritesFolder) => {
        set(subfolder, 'isExpanded', false);
      }
    );
  }

  _expandFolder() {
    set(this.folder, 'isExpanded', true);
  }
}
