// Vendors
import Component from '@ember/component';
import {action, set} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import {FavoritesTrade} from 'better-trading/types/favorites';

export default class BtFavoritesTreeTrade extends Component {
  @service('trade-location')
  tradeLocation: TradeLocation;

  isEditing = false;

  trade: FavoritesTrade;
  onUpdate: () => void;
  onDelete: () => void;

  @action
  navigateToTrade() {
    this.tradeLocation.navigateToTrade(this.trade.slug);
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
    set(this.trade, 'title', newTitle);
    this.set('isEditing', false);
    this.onUpdate();
  }
}
