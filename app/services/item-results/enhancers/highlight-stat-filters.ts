// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {escapeRegex} from 'better-trading/utilities/escape-regex';

// Types
import SearchPanel from 'better-trading/services/search-panel';
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';

// Constants
const MODS_SELECTOR = '.explicitMod,.pseudoMod,.implicitMod';

export default class HighlightStatFilters extends Service implements ItemResultsEnhancerService {
  @service('search-panel')
  searchPanel: SearchPanel;

  statNeedles: RegExp[];

  prepare() {
    const stats = this.searchPanel.getStats();

    this.statNeedles = stats.map((rawStat: string) => {
      return new RegExp(escapeRegex(rawStat).replace(/#/g, '[\\+\\-]?\\d+'), 'i');
    });
  }

  enhance(itemElement: HTMLElement) {
    itemElement.querySelectorAll(MODS_SELECTOR).forEach((modElement: HTMLElement) => {
      const modText = modElement.textContent || '';
      if (!this.statNeedles.some((needle) => needle.test(modText))) return;

      modElement.classList.add('bt-highlight-stat-filters');
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/highlight-stat-filters': HighlightStatFilters;
  }
}
