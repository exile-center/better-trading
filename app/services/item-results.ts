// Vendor
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';
import {enqueueTask} from 'ember-concurrency-decorators';
import Evented from '@ember/object/evented';

// Types
import ItemResultsEnhancersEquivalentPricings from 'better-trading/services/item-results/enhancers/equivalent-pricings';
import ItemResultsEnhancersHighlightStatFilters from 'better-trading/services/item-results/enhancers/highlight-stat-filters';
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';
import {Task} from 'better-trading/types/ember-concurrency';
import ItemResultsEnhancersPinnable from 'better-trading/services/item-results/enhancers/pinnable';

// Utilities
import {asyncLoop} from 'better-trading/utilities/async-loop';

export default class ItemResults extends Service.extend(Evented) {
  @service('item-results/enhancers/highlight-stat-filters')
  itemResultsEnhancersHighlightStatFilters: ItemResultsEnhancersHighlightStatFilters;

  @service('item-results/enhancers/equivalent-pricings')
  itemResultsEnhancersEquivalentPricings: ItemResultsEnhancersEquivalentPricings;

  @service('item-results/enhancers/pinnable')
  itemResultsEnhancersPinnable: ItemResultsEnhancersPinnable;

  resultsObserver: MutationObserver;

  get enhancersSequence(): ItemResultsEnhancerService[] {
    return [
      this.itemResultsEnhancersHighlightStatFilters,
      this.itemResultsEnhancersEquivalentPricings,
      this.itemResultsEnhancersPinnable
    ];
  }

  @enqueueTask
  *enhanceTask() {
    const unenhancedElements = Array.prototype.slice.call(
      window.document.querySelectorAll('.resultset > :not([bt-enhanced])')
    );

    if (!unenhancedElements.length) return;

    yield asyncLoop<ItemResultsEnhancerService>(
      this.enhancersSequence,
      enhancer => enhancer.prepare && enhancer.prepare()
    );

    yield asyncLoop<HTMLElement>(unenhancedElements, async unenhancedElement => {
      await asyncLoop<ItemResultsEnhancerService>(this.enhancersSequence, enhancer => {
        return enhancer.enhance(unenhancedElement);
      });

      unenhancedElement.toggleAttribute('bt-enhanced', true);
    });
  }

  async initialize() {
    const tradeAppElement = window.document.getElementById('trade');
    if (!tradeAppElement || !tradeAppElement.parentElement) return;

    this.resultsObserver = new MutationObserver(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (this.enhanceTask as Task).perform();
    });

    this.resultsObserver.observe(tradeAppElement.parentElement, {
      childList: true,
      subtree: true
    });

    await asyncLoop<ItemResultsEnhancerService>(
      this.enhancersSequence,
      enhancer => enhancer.initialize && enhancer.initialize()
    );
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
