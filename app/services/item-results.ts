// Vendor
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';
import {enqueueTask} from 'ember-concurrency-decorators';

// Types
import ItemResultsEnhancersEquivalentPricings from 'better-trading/services/item-results/enhancers/equivalent-pricings';
import ItemResultsEnhancersHighlightStatFilters from 'better-trading/services/item-results/enhancers/highlight-stat-filters';
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';

// Utilities
import {asyncLoop} from 'better-trading/utilities/async-loop';
import {Task} from 'better-trading/types/ember-concurrency';

export default class ItemResults extends Service {
  @service('item-results/enhancers/highlight-stat-filters')
  itemResultsEnhancersHighlightStatFilters: ItemResultsEnhancersHighlightStatFilters;

  @service('item-results/enhancers/equivalent-pricings')
  itemResultsEnhancersEquivalentPricings: ItemResultsEnhancersEquivalentPricings;

  resultsObserver: MutationObserver;

  get enhancersSequence(): ItemResultsEnhancerService[] {
    return [this.itemResultsEnhancersHighlightStatFilters, this.itemResultsEnhancersEquivalentPricings];
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
      return asyncLoop<ItemResultsEnhancerService>(this.enhancersSequence, enhancer => {
        return enhancer.enhance(unenhancedElement);
      });
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

  teardown(): void {
    this.resultsObserver.disconnect();
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results': ItemResults;
  }
}
