// Vendors
import {A} from '@ember/array';
import Component from '@ember/component';
import {action, set} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import SearchPanel from 'better-trading/services/search-panel';
import TradeLocation from 'better-trading/services/trade-location';
import {FavoritesFolder} from 'better-trading/types/favorites';

export default class BtFavoritesTreeFolder extends Component {
  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('search-panel')
  searchPanel: SearchPanel;

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

    this.onUpdate();
  }

  @action
  createTrade() {
    if (!this.tradeLocation.slug) return;

    this.folder.items.unshiftObject({
      slug: this.tradeLocation.slug,
      title: this.searchPanel.recommendTitle()
    });

    this.onUpdate();
  }
}
