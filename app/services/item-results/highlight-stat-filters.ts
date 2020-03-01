// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {escapeRegex} from 'better-trading/utilities/escape-regex';

// Types
import SearchPanel from 'better-trading/services/search-panel';

// Constants
const MODS_SELECTOR = '.explicitMod,.pseudoMod,.implicitMod';

export default class ItemResultsHighlightStatFilters extends Service {
  @service('search-panel')
  searchPanel: SearchPanel;

  statNeedles: RegExp[];

  prepare(): void {
    const {stats} = this.searchPanel.scrape();

    this.statNeedles = stats.map((rawStat: string) => {
      return new RegExp(escapeRegex(rawStat).replace(/#/g, '[\\+\\-]?\\d+'), 'i');
    });
  }

  process(result: HTMLElement): void {
    result.querySelectorAll(MODS_SELECTOR).forEach((modElement: HTMLElement) => {
      const modText = modElement.textContent || '';
      if (!this.statNeedles.some(needle => needle.test(modText))) return;

      modElement.classList.add('bt-highlight-stat-filters');
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/highlight-stat-filters': ItemResultsHighlightStatFilters;
  }
}
