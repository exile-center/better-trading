// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService, ItemResultsParsedItem, ItemResultsType} from 'better-trading/types/item-results';
import IntlService from 'ember-intl/services/intl';

// Constants
const ILVL_THRESHOLDS = [
  {maxSockets: 2, ilvl: 1},
  {maxSockets: 3, ilvl: 24},
  {maxSockets: 4, ilvl: 34},
  {maxSockets: 5, ilvl: 49},
];

export default class MaximumSockets extends Service implements ItemResultsEnhancerService {
  @service('intl')
  intl: IntlService;

  slug = 'maximum-sockets';

  statNeedles: RegExp[];

  // eslint-disable-next-line complexity
  enhance(itemElement: HTMLElement, {socketsCount, type, ilvl}: ItemResultsParsedItem) {
    const itemFrameElement = itemElement.querySelector<HTMLDivElement>('.itemRendered');

    if (!itemFrameElement || !ilvl || socketsCount === 0 || type !== ItemResultsType.ARMOR) return;

    const applicableThreshold = ILVL_THRESHOLDS.find((threshold) => ilvl <= threshold.ilvl);
    if (!applicableThreshold) return;

    if (applicableThreshold.maxSockets <= socketsCount) return;

    itemFrameElement.prepend(this.renderWarning(applicableThreshold.maxSockets));
  }

  private renderWarning(maximumSockets: number) {
    const warningElement = window.document.createElement('div');
    warningElement.textContent = this.intl.t('item-results.maximum-sockets.warning', {maximum: maximumSockets});
    warningElement.classList.add('bt-maximum-sockets');

    return warningElement;
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/maximum-sockets': MaximumSockets;
  }
}
