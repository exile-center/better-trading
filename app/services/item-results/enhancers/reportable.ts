// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService, ItemResultsParsedItem} from 'better-trading/types/item-results';
import IntlService from 'ember-intl/services/intl';
import TheForbiddenTrove from 'better-trading/services/the-forbidden-trove';

export default class Reportable extends Service implements ItemResultsEnhancerService {
  @service('the-forbidden-trove')
  theForbiddenTrove: TheForbiddenTrove;

  @service('intl')
  intl: IntlService;

  enhance(itemElement: HTMLElement, {seller}: ItemResultsParsedItem) {
    const detailsElement = itemElement.querySelector('.details .pull-left');
    if (!detailsElement) return;

    const reportButton = window.document.createElement('button');
    reportButton.classList.add('bt-report-button');
    reportButton.textContent = this.intl.t('item-results.reportable.report');

    reportButton.addEventListener('click', () => {
      if (!seller.accountName || !seller.characterName) return;

      this.theForbiddenTrove.report(
        seller.accountName,
        seller.characterName,
        window.location.origin + window.location.pathname
      );
    });

    detailsElement.appendChild(reportButton);
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/reportable': Reportable;
  }
}
