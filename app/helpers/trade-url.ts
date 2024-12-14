// Vendor
import Helper from '@ember/component/helper';
import {inject as service} from '@ember/service';

// Services
import TradeLocation from 'better-trading/services/trade-location';

// Types
import type {TradeSiteVersion} from 'better-trading/types/trade-location';

type PositionalParams = [{version: TradeSiteVersion; slug: string; type: string}];
interface NamedParams {
  suffix?: string;
  league: string; // in non-PC realms, should be of form "realm/LeagueName", eg "xbox/Legion"
}

export default class TradeUrl extends Helper {
  @service('trade-location')
  tradeLocation: TradeLocation;

  compute([{version, type, slug}]: PositionalParams, {suffix, league}: NamedParams) {
    const tradeUrl = this.tradeLocation.getTradeUrl(version, type, slug, league);

    if (!suffix) return tradeUrl;

    return tradeUrl + suffix;
  }
}
