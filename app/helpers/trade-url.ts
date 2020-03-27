// Vendor
import Helper from '@ember/component/helper';
import {inject as service} from '@ember/service';

// Types
import Location from 'better-trading/services/location';

export default class TradeUrl extends Helper {
  @service('location')
  location: Location;

  compute(params: string[]) {
    const [type, slug, suffix] = params;
    const tradeURL = this.location.getTradeUrl(type, slug);

    if (!suffix) return tradeURL;

    return tradeURL + suffix;
  }
}
