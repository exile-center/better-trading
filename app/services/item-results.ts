// Vendor
import Service, {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import Evented from '@ember/object/evented';

// Types
import Pinnable from 'better-trading/services/item-results/enhancers/pinnable';
import Storage from 'better-trading/services/storage';
import ItemResultsEnhance from 'better-trading/services/item-results/enhance';
import ItemElement from 'better-trading/services/item-results/item-element';

// Constants
const DISABLED_ENHANCERS_STORAGE_KEY = 'disabled-enhancers';

export default class ItemResults extends Service.extend(Evented) {
  @service('storage')
  storage: Storage;

  @service('item-results/enhance')
  enhance: ItemResultsEnhance;

  @service('item-results/item-element')
  itemElement: ItemElement;

  @service('item-results/enhancers/pinnable')
  pinnableEnhancer: Pinnable;

  @tracked
  disabledEnhancerSlugs: string[] = (this.storage.getLocalValue(DISABLED_ENHANCERS_STORAGE_KEY) || '')
    .split(',')
    .filter(Boolean);

  async initialize() {
    await this.enhance.initialize();
  }

  getEnhancerSlugs() {
    return this.enhance.getEnhancerSlugs();
  }

  setDisabledEnhancerSlugs(disabledEnhancerSlugs: string[]) {
    this.storage.setLocalValue(DISABLED_ENHANCERS_STORAGE_KEY, disabledEnhancerSlugs.join(','));
    this.disabledEnhancerSlugs = disabledEnhancerSlugs;
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
