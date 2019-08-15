// Vendors
import Component from '@ember/component';
import {action, set} from '@ember/object';

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
}
