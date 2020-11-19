// Vendor
import {inject as service} from '@ember/service';
import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

// Types
import Storage from 'better-trading/services/storage';
import ItemResults from 'better-trading/services/item-results';

// Constants
const CURRENT_PAGE_KEY = 'current-page';

export enum RootPage {
  BOOKMARKS = 'bookmarks',
  HISTORY = 'history',
  PINNED_ITEMS = 'pinned-items',
}

export default class RootController extends Controller {
  @service('storage')
  storage: Storage;

  @service('item-results')
  itemResults: ItemResults;

  @tracked
  currentPage: RootPage = (this.storage.getLocalValue(CURRENT_PAGE_KEY) as RootPage) || RootPage.BOOKMARKS;

  get currentPageComponentName() {
    return `page/${this.currentPage}`;
  }

  @action
  changeCurrentPage(page: RootPage) {
    this.storage.setLocalValue(CURRENT_PAGE_KEY, page);
    this.currentPage = page;
  }

  @action
  subscribeToPinnedItemsChange() {
    this.itemResults.on('pinned-items-change', this, this.navigateToPinnedItems);
  }

  @action
  unsubscribeFromPinnedItemsChange() {
    this.itemResults.off('pinned-items-change', this, this.navigateToPinnedItems);
  }

  private navigateToPinnedItems() {
    this.changeCurrentPage(RootPage.PINNED_ITEMS);
  }
}
