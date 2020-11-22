// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService, ItemResultsPinnedItem} from 'better-trading/types/item-results';
import IntlService from 'ember-intl/services/intl';
import ItemResults from 'better-trading/services/item-results';
import FlashMessages from 'ember-cli-flash/services/flash-messages';

interface PinnedItemsMap {
  [id: string]: ItemResultsPinnedItem;
}

export default class Pinnable extends Service implements ItemResultsEnhancerService {
  @service('item-results')
  itemResults: ItemResults;

  @service('intl')
  intl: IntlService;

  @service('flash-messages')
  flashMessages: FlashMessages;

  pinnedItems: PinnedItemsMap = {};

  enhance(itemElement: HTMLElement) {
    const detailsElement = itemElement.querySelector('.details .pull-left');
    if (!detailsElement) return;

    detailsElement.appendChild(this.renderPinButton());
  }

  getPinnedItems() {
    return Object.values(this.pinnedItems);
  }

  clear() {
    if (Object.keys(this.pinnedItems).length === 0) return;

    this.pinnedItems = {};
    this.hasChanged();
  }

  unpinItemById(itemId: string) {
    delete this.pinnedItems[itemId];
    this.hasChanged();
  }

  // eslint-disable-next-line complexity
  private handlePinClick(event: MouseEvent) {
    if (!event.target) return;

    const itemElement = (event.target as HTMLElement).closest('[bt-enhanced]') as HTMLElement;
    const itemId = itemElement.dataset.id;
    if (!itemElement || !itemId) return;

    if (this.pinnedItems[itemId]) {
      delete this.pinnedItems[itemId];
    } else {
      const pinnedItem = this.createPinnedItem(itemId, itemElement);

      if (pinnedItem) {
        this.pinnedItems[itemId] = pinnedItem;
      } else {
        this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
      }
    }

    this.hasChanged();
  }

  private renderPinButton(): HTMLElement {
    const element = window.document.createElement('button');
    element.classList.add('bt-pin-button');
    element.innerHTML = `
      <span class="bt-pin-button-unpinned">
        ${this.intl.t('item-results.pinnable.pin')}
      </span>
      <span class="bt-pin-button-pinned">
        ${this.intl.t('item-results.pinnable.unpin')}
      </span>
    `;
    element.addEventListener('click', this.handlePinClick.bind(this));

    return element;
  }

  private createPinnedItem(id: string, result: HTMLElement): ItemResultsPinnedItem | null {
    const detailsElement = result.querySelector('.middle') as HTMLElement;
    const socketsElement = result.querySelector('.sockets') as HTMLElement;
    const pricingElement = result.querySelector('.details .price') as HTMLElement;

    if (!detailsElement || !socketsElement || !pricingElement) return null;

    return {
      id,
      detailsElement: detailsElement.cloneNode(true) as HTMLElement,
      socketsElement: socketsElement.cloneNode(true) as HTMLElement,
      pricingElement: pricingElement.cloneNode(true) as HTMLElement,
      pinnedAt: new Date().toISOString(),
    };
  }

  private updatePinnedCSS() {
    const pinnedIds = Object.keys(this.pinnedItems);

    window.document.querySelectorAll('[bt-enhanced]').forEach((itemResult: HTMLElement) => {
      if (!itemResult.dataset.id) return;

      itemResult.classList.toggle('bt-pinned', pinnedIds.includes(itemResult.dataset.id));
    });
  }

  private hasChanged() {
    this.updatePinnedCSS();
    this.itemResults.trigger('pinned-items-change');
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/pinnable': Pinnable;
  }
}
