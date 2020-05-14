// Vendor
import Helper from '@ember/component/helper';
import {inject as service} from '@ember/service';

// Types
import TradeLocation from 'better-trading/services/trade-location';

type PositionalParams = [{slug: string; type: string}];
interface NamedParams {
  suffix?: string;
  league: string;
}

export default class TradeUrl extends Helper {
  @service('trade-location')
  tradeLocation: TradeLocation;

  compute([{type, slug}]: PositionalParams, {suffix, league}: NamedParams) {
    const tradeURL = this.tradeLocation.getTradeUrl(type, slug, league);

    if (!suffix) return tradeURL;

    return tradeURL + suffix;
  }
}
