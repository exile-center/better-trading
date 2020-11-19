// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';
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

  statNeedles: RegExp[];

  // eslint-disable-next-line complexity
  enhance(result: HTMLElement) {
    const currentSocketsCount = result.querySelectorAll('.sockets .socket').length || 0;
    if (currentSocketsCount === 0) return;

    const iconElement = result.querySelector('.icon img') as HTMLImageElement | undefined;
    if (!iconElement) return;
    if (!/BodyArmours/.test(iconElement.src)) return;

    const ilvlElement = result.querySelector('.itemLevel');

    const ilvlMatch = ilvlElement?.textContent?.match(/(\d+)/);
    if (!ilvlMatch) return;

    const ilvl = parseInt(ilvlMatch[0], 10);
    const applicableThreshold = ILVL_THRESHOLDS.find((threshold) => ilvl <= threshold.ilvl);
    if (!applicableThreshold) return;

    if (applicableThreshold.maxSockets <= currentSocketsCount) return;

    const itemFrameElement = result.querySelector('.itemRendered');
    if (!itemFrameElement) return;

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
