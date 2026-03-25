// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {dropTask} from 'ember-concurrency-decorators';
import window from 'ember-window-mock';

// Utilities
import {parseItemText} from 'better-trading/utilities/item-parser';

// Types
import TradeSearch from 'better-trading/services/trade-search';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import IntlService from 'ember-intl/services/intl';
import {ParsedItem} from 'better-trading/types/item-parser';

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

  @tracked
  isSearching: boolean = false;

  @action
  updateItemText(event: InputEvent) {
    const textarea = event.target as HTMLTextAreaElement;
    this.itemText = textarea.value;
    this.errorMessage = null;

    // Auto-parse on text change
    if (this.itemText.trim()) {
      this.parsedItem = parseItemText(this.itemText);
    } else {
      this.parsedItem = null;
    }
  }

  @action
  async handlePaste(event: ClipboardEvent) {
    // Allow the paste to happen naturally, then parse
    setTimeout(() => {
      const textarea = event.target as HTMLTextAreaElement;
      this.itemText = textarea.value;
      this.errorMessage = null;

      if (this.itemText.trim()) {
        this.parsedItem = parseItemText(this.itemText);
        if (!this.parsedItem) {
          this.errorMessage = this.intl.t('components.paste-item-modal.parse-error');
        }
      }
    }, 0);
  }

  @dropTask
  *searchTask() {
    if (!this.itemText.trim()) {
      this.errorMessage = this.intl.t('components.paste-item-modal.empty-error');
      return;
    }

    const parsed = parseItemText(this.itemText);
    if (!parsed) {
      this.errorMessage = this.intl.t('components.paste-item-modal.parse-error');
      return;
    }

    this.isSearching = true;
    this.errorMessage = null;

    try {
      const resultUrl: string = yield this.tradeSearch.executeSearch(parsed);

      this.flashMessages.success(
        this.intl.t('components.paste-item-modal.search-success')
      );

      this.args.onClose();

      // Navigate to the search results
      window.location.href = resultUrl;
    } catch (error) {
      this.errorMessage = error instanceof Error
        ? error.message
        : this.intl.t('components.paste-item-modal.search-error');
    } finally {
      this.isSearching = false;
    }
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
}
