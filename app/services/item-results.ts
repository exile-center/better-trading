// Vendor
import Service, {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import window from 'ember-window-mock';

// Types
import ItemResultsEquivalentPricings from 'better-trading/services/item-results/equivalent-pricings';
import ItemResultsHighlightStatFilters from 'better-trading/services/item-results/highlight-stat-filters';
import Settings from 'better-trading/services/settings';

export default class ItemResults extends Service.extend({
  enhanceResultsTask: task(function*(this: ItemResults) {
    yield this.enhance();
  }).enqueue()
}) {
  @service('settings')
  settings: Settings;

  @service('item-results/highlight-stat-filters')
  itemResultsHighlightStatFilters: ItemResultsHighlightStatFilters;

  @service('item-results/equivalent-pricings')
  itemResultsEquivalentPricings: ItemResultsEquivalentPricings;

  resultsObserver: MutationObserver;

  watchResults() {
    const tradeAppElement = window.document.getElementById('trade');
    if (!tradeAppElement || !tradeAppElement.parentElement) return;

    this.resultsObserver = new MutationObserver(() => this.enhanceResultsTask.perform());

    this.resultsObserver.observe(tradeAppElement.parentElement, {
      childList: true,
      subtree: true
    });
  }

  willDestroy(): void {
    this.resultsObserver.disconnect();
  }

  private async enhance(): Promise<void> {
    const unenhancedElements = window.document.querySelectorAll('.resultset > :not([bt-enhanced])');

    if (!unenhancedElements.length) return;

    this.itemResultsHighlightStatFilters.prepare();
    await this.itemResultsEquivalentPricings.prepare();

    unenhancedElements.forEach((resultElement: HTMLElement) => {
      if (this.settings.itemResultsHighlightStatFiltersEnabled) {
        this.itemResultsHighlightStatFilters.process(resultElement);
      }

      if (this.settings.itemResultsEquivalentPricingsEnabled) {
        this.itemResultsEquivalentPricings.process(resultElement);
      }

      resultElement.toggleAttribute('bt-enhanced', true);
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results': ItemResults;
  }
}
