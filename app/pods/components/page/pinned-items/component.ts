// Vendor
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {task} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';

// Types
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import IntlService from 'ember-intl/services/intl';
import ItemResults from 'better-trading/services/item-results';
import {ItemResultsPinnedItem} from 'better-trading/types/item-results';

// Constants
const SCROLL_ANIMATION_DURATION_IN_MILLISECONDS = 2000;
const SCROLL_ANIMATION_DELAY_IN_MILLISECONDS = 250;

export default class PagePinnedItems extends Component {
  @service('item-results')
  itemResults: ItemResults;

  @service('flash-messages')
  flashMessages: FlashMessages;

  @service('intl')
  intl: IntlService;

  @tracked
  pinnedItems: ItemResultsPinnedItem[] = [];

  get sortedPinnedItems() {
    return this.pinnedItems.sort(
      (pinnedItemA, pinnedItemB) => new Date(pinnedItemA.pinnedAt).getTime() - new Date(pinnedItemB.pinnedAt).getTime()
    );
  }

  @task
  *scrollToItemTask(itemId: string) {
    const itemElement = window.document.querySelector(`div.row[data-id="${itemId}"]`);
    if (!itemElement) {
      return this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    }

    itemElement.scrollIntoView({block: 'center'});

    yield timeout(SCROLL_ANIMATION_DELAY_IN_MILLISECONDS);
    itemElement.classList.add('bt-pinned-glow');

    yield timeout(SCROLL_ANIMATION_DURATION_IN_MILLISECONDS);
    itemElement.classList.remove('bt-pinned-glow');
  }

  @action
  subscribeToPinnedItemsChange() {
    this.itemResults.on('pinned-items-change', this, this.getPinnedItems);
  }

  @action
  unsubscribeFromPinnedItemsChange() {
    this.itemResults.off('pinned-items-change', this, this.getPinnedItems);
  }

  @action
  clearPinnedItems() {
    this.itemResults.clearPinnedItems();
  }

  @action
  getPinnedItems() {
    this.pinnedItems = this.itemResults.getPinnedItems();
  }

  @action
  unpinItem(itemId: string) {
    this.itemResults.unpinItemById(itemId);
  }
}
