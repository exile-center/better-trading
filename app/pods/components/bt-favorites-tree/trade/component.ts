// Vendors
import Component from '@ember/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import {FavoritesTrade} from 'better-trading/types/favorites';

export default class BtFavoritesTreeTrade extends Component {
  @service('trade-location')
  tradeLocation: TradeLocation;

  trade: FavoritesTrade;
  onDelete: () => void;

  @action
  navigateToTrade() {
    this.tradeLocation.navigateToTrade(this.trade.slug);
  }
}
