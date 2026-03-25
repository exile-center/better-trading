// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {dropTask} from 'ember-concurrency-decorators';
import {didCancel} from 'ember-concurrency';
import window from 'ember-window-mock';

// Utilities
import {parseItemText} from 'better-trading/utilities/item-parser';

// Types
import TradeSearch from 'better-trading/services/trade-search';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import IntlService from 'ember-intl/services/intl';
import {ParsedItem} from 'better-trading/types/item-parser';
import {Task} from 'better-trading/types/ember-concurrency';

interface Args {
  onClose: () => void;
}

export default class PasteItemModal extends Component<Args> {
  @service('trade-search')
  tradeSearch: TradeSearch;

  @service('flash-messages')
  flashMessages: FlashMessages;

  @service('intl')
  intl: IntlService;

  @tracked
  itemText: string = '';

  @tracked
  parsedItem: ParsedItem | null = null;

  @tracked
  errorMessage: string | null = null;

  // Fix #6: Use searchTask.isRunning instead of manual isSearching flag
  get isSearching(): boolean {
    return (this.searchTask as Task).isRunning;
  }

  get itemSummary(): string | null {
    if (!this.parsedItem) return null;

    const parts: string[] = [];
    if (this.parsedItem.rarity) parts.push(this.parsedItem.rarity);
    if (this.parsedItem.name) parts.push(this.parsedItem.name);
    if (this.parsedItem.baseType && this.parsedItem.baseType !== this.parsedItem.name) {
      parts.push(this.parsedItem.baseType);
    }

    return parts.join(' — ');
  }

  get modCount(): number {
    if (!this.parsedItem) return 0;
    return this.parsedItem.implicits.length + this.parsedItem.explicits.length;
  }

  get canSearch(): boolean {
    return this.parsedItem !== null && !this.isSearching;
  }

  // Fix #8: Single handler for all text changes (input covers paste too).
  // Also shows parse error feedback consistently.
  @action
  updateItemText(event: InputEvent) {
    const textarea = event.target as HTMLTextAreaElement;
    this.itemText = textarea.value;
    this.errorMessage = null;

    if (this.itemText.trim()) {
      this.parsedItem = parseItemText(this.itemText);
      if (!this.parsedItem) {
        this.errorMessage = this.intl.t('components.paste-item-modal.parse-error');
      }
    } else {
      this.parsedItem = null;
    }
  }

  @dropTask
  *searchTask() {
    // Fix #7: Use already-parsed item instead of re-parsing
    if (!this.parsedItem) {
      this.errorMessage = this.intl.t('components.paste-item-modal.parse-error');
      return;
    }

    this.errorMessage = null;

    try {
      const resultUrl: string = yield this.tradeSearch.executeSearch(this.parsedItem);

      this.flashMessages.success(
        this.intl.t('components.paste-item-modal.search-success')
      );

      // Fix #10: Navigate first, then close. Navigation replaces the page anyway,
      // and calling onClose first would destroy this component before navigation.
      window.location.href = resultUrl;
      this.args.onClose();
    } catch (error) {
      // Fix #9: Don't treat task cancellation as a user-facing error
      if (didCancel(error)) return;

      this.errorMessage = error instanceof Error
        ? error.message
        : this.intl.t('components.paste-item-modal.search-error');
    }
  }
}
