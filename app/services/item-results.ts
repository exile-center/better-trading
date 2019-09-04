// Vendors
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';

// Types
import ItemResultsHighlightStatFilters from "better-trading/services/item-results/highlight-stat-filters";
import Settings from "better-trading/services/settings";

export default class ItemResults extends Service {
  @service('settings')
  settings: Settings;

  @service('item-results/highlight-stat-filters')
  itemResultsHighlightStatFilters: ItemResultsHighlightStatFilters;

  resultsObserver: MutationObserver;

  watchResults() {
    const tradeAppElement = window.document.getElementById('trade');
    if (!tradeAppElement || !tradeAppElement.parentElement) return;

    this.resultsObserver = new MutationObserver(() => this._enhance());

    this.resultsObserver.observe(tradeAppElement.parentElement, {
      childList: true,
      subtree: true
    });
  }

  willDestroy(): void {
    this.resultsObserver.disconnect();
  }

  _enhance() {
    this.itemResultsHighlightStatFilters.prepare();

    window.document.querySelectorAll('.resultset > :not([bt-enhanced])').forEach((resultElement: HTMLElement) => {
      if (this.settings.itemResultsHighlightStatFiltersEnabled) {
        this.itemResultsHighlightStatFilters.process(resultElement);
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
