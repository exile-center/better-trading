// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';
import TradeLocation from 'better-trading/services/trade-location';
import IntlService from 'ember-intl/services/intl';
import FlashMessages from 'ember-cli-flash/services/flash-messages';

// Utilities
import {copyToClipboard} from 'better-trading/utilities/copy-to-clipboard';
import {itemText} from 'better-trading/utilities/item-text';

export default class CopyItem extends Service implements ItemResultsEnhancerService {
  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('intl')
  intl: IntlService;

  @service('flash-messages')
  flashMessages: FlashMessages;

  private enhancedButtons = new WeakSet<HTMLButtonElement>();

  enhance(itemElement: HTMLElement) {
    if (this.tradeLocation.version !== '2') return;

    const button = itemElement.querySelector<HTMLButtonElement>('.left button.copy');
    if (!button || this.enhancedButtons.has(button)) return;

    this.enhancedButtons.add(button);
    button.addEventListener(
      'click',
      (event) => {
        // Leave native copying alone whenever the site supplies item text.
        if (!button.classList.contains('hidden') && !button.hidden && button.style.display !== 'none') return;

        // The native clipboard listener would otherwise overwrite our copy with empty text.
        event.preventDefault();
        event.stopImmediatePropagation();
        this.copyItem(itemElement);
      },
      true
    );
  }

  private copyItem(itemElement: HTMLElement) {
    const text = itemText(itemElement);
    if (!text) {
      this.flashMessages.alert(this.intl.t('item-results.copy-item.unreadable'));
      // eslint-disable-next-line no-console
      console.warn('[Better Trading] Copy Item could not read the item popup.');
      return;
    }

    try {
      if (!copyToClipboard(text)) throw new Error('The browser rejected the clipboard write.');
      this.flashMessages.success(this.intl.t('item-results.copy-item.success'));
    } catch (error) {
      this.flashMessages.alert(this.intl.t('item-results.copy-item.clipboard-failed'));
      // eslint-disable-next-line no-console
      console.warn('[Better Trading] Copy Item could not write to the clipboard.', error);
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/copy-item': CopyItem;
  }
}
