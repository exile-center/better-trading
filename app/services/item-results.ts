// Vendor
import Service, {inject as service} from '@ember/service';
import Evented from '@ember/object/evented';

// Types
import Pinnable from 'better-trading/services/item-results/enhancers/pinnable';

// Utilities
import ItemResultsEnhance from 'better-trading/services/item-results/enhance';

export default class ItemResults extends Service.extend(Evented) {
  @service('item-results/enhance')
  itemResultsEnhance: ItemResultsEnhance;

  @service('item-results/enhancers/pinnable')
  itemResultsEnhancersPinnable: Pinnable;

  async initialize() {
    await this.itemResultsEnhance.initialize();
  }

  clearPinnedItems() {
    return this.itemResultsEnhancersPinnable.clear();
  }

  unpinItemById(itemId: string) {
    return this.itemResultsEnhancersPinnable.unpinItemById(itemId);
  }

  getPinnedItems() {
    return this.itemResultsEnhancersPinnable.getPinnedItems();
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results': ItemResults;
  }
}
