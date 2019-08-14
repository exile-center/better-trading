// Vendors
import Component from '@ember/component';
import {action} from '@ember/object';

// Types
import {FavoritesFolder} from 'better-trading/types/favorites';

export default class BtFavoritesTreeFolder extends Component {
  folder: FavoritesFolder;
  onUpdate: (updatedFolder: Pick<FavoritesFolder, 'isExpanded'>) => void;

  @action
  toggleExpanded() {
    this.onUpdate({
      isExpanded: !this.folder.isExpanded
    });
  }
}
