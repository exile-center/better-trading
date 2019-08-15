// Vendors
import Component from '@ember/component';
import {action, set} from '@ember/object';
import {A} from "@ember/array";

// Types
import {FavoritesFolder} from 'better-trading/types/favorites';

export default class BtFavoritesTreeFolder extends Component {
  folder: FavoritesFolder;
  onUpdate: () => void;
  onMoveItem: () => void;

  @action
  toggleExpanded() {
    set(this.folder, 'isExpanded', !this.folder.isExpanded);

    this.onUpdate();
  }

  @action
  createFolder() {
    this.folder.items.unshiftObject({
      isExpanded: true,
      items: A([]),
      title: 'Untitled folder'
    });
  }
}
