// Vendor
import Helper from '@ember/component/helper';
import {inject as service} from '@ember/service';

// Types
import TradeLocation from 'better-trading/services/trade-location';

type PositionalParams = [{slug: string; type: string, baseUrl?: string}];
interface NamedParams {
  suffix?: string;
  league: string;
}

export default class TradeUrl extends Helper {
  @service('trade-location')
  tradeLocation: TradeLocation;

  compute([{type, slug, baseUrl}]: PositionalParams, {suffix, league}: NamedParams) {
    const tradeUrl = this.tradeLocation.getTradeUrl(type, slug, league, baseUrl);

    if (!suffix) return tradeUrl;

    return tradeUrl + suffix;
  }
}
