// Vendor
import Service, {inject as service} from '@ember/service';
import {enqueueTask} from 'ember-concurrency-decorators';
import window from 'ember-window-mock';

// Types
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';
import ItemResultsEnhancersHighlightStatFilters from 'better-trading/services/item-results/enhancers/highlight-stat-filters';
import ItemResultsEnhancersEquivalentPricings from 'better-trading/services/item-results/enhancers/equivalent-pricings';
import ItemResultsEnhancersPinnable from 'better-trading/services/item-results/enhancers/pinnable';
import {Task} from 'better-trading/types/ember-concurrency';

// Utilities
import {asyncLoop} from 'better-trading/utilities/async-loop';

export default class ItemResultsEnhance extends Service {
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
    const itemElementsCount = window.document.querySelectorAll('.resultset > div.row').length;
    const unenhancedElements = Array.prototype.slice.call(
      window.document.querySelectorAll('.resultset > div.row:not([bt-enhanced])')
    );

    if (unenhancedElements.length) {
      yield this.enhanceItems(unenhancedElements);
    } else if (itemElementsCount === 0) {
      yield this.clearEnhancedItems();
    }
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

  private async enhanceItems(unenhancedElements: HTMLElement[]) {
    await asyncLoop<ItemResultsEnhancerService>(
      this.enhancersSequence,
      enhancer => enhancer.prepare && enhancer.prepare()
    );

    await asyncLoop<HTMLElement>(unenhancedElements, async unenhancedElement => {
      await asyncLoop<ItemResultsEnhancerService>(this.enhancersSequence, enhancer => {
        return enhancer.enhance(unenhancedElement);
      });

      unenhancedElement.toggleAttribute('bt-enhanced', true);
    });
  }

  private async clearEnhancedItems() {
    await asyncLoop<ItemResultsEnhancerService>(this.enhancersSequence, enhancer => enhancer.clear && enhancer.clear());
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhance': ItemResultsEnhance;
  }
}
