// Vendor
import Service, {inject as service} from '@ember/service';
import Evented from '@ember/object/evented';

// Types
import Pinnable from 'better-trading/services/item-results/enhancers/pinnable';

// Utilities
import ItemResultsEnhance from 'better-trading/services/item-results/enhance';
import ItemElement from 'better-trading/services/item-results/item-element';

export default class ItemResults extends Service.extend(Evented) {
  @service('item-results/enhance')
  enhance: ItemResultsEnhance;

  @service('item-results/item-element')
  itemElement: ItemElement;

  @service('item-results/enhancers/pinnable')
  pinnableEnhancer: Pinnable;

  async initialize() {
    await this.enhance.initialize();
  }

  clearPinnedItems() {
    return this.pinnableEnhancer.clear();
  }

  unpinItemById(itemId: string) {
    return this.pinnableEnhancer.unpinItemById(itemId);
  }

  getPinnedItems() {
    return this.pinnableEnhancer.getPinnedItems();
  }

  parseItemElement(itemElement: HTMLDivElement) {
    return this.itemElement.parseElement(itemElement);
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results': ItemResults;
  }
}
