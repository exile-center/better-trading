// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService, ItemResultsParsedItem} from 'better-trading/types/item-results';
import TheForbiddenTrove from 'better-trading/services/the-forbidden-trove';
import {TheForbbidenTroveBlacklistEntry} from 'better-trading/types/the-forbidden-trove';

export default class ScamPrevention extends Service implements ItemResultsEnhancerService {
  @service('the-forbidden-trove')
  theForbiddenTrove: TheForbiddenTrove;

  private blacklistMap: Map<string, TheForbbidenTroveBlacklistEntry> = new Map();

  async prepare() {
    const blacklistEntries = await this.theForbiddenTrove.fetchBlacklist();

    blacklistEntries.forEach((blacklistEntry) => {
      this.blacklistMap.set(blacklistEntry.accountName.toLowerCase(), blacklistEntry);
    });
  }

  // eslint-disable-next-line complexity
  enhance(itemElement: HTMLElement, {seller}: ItemResultsParsedItem) {
    const whisperButtonElement = itemElement.querySelector<HTMLButtonElement>('button.whisper-btn');
    const characterNameElement = itemElement.querySelector<HTMLSpanElement>('.character-name');
    if (!whisperButtonElement || !characterNameElement || !seller.accountName) return;

    const correspondingBlacklistEntry = this.blacklistMap.get(seller.accountName.toLowerCase());
    if (!correspondingBlacklistEntry) return;

    characterNameElement.classList.add('bt-scam-prevention');

    whisperButtonElement.addEventListener('click', () => {
      this.theForbiddenTrove.promptBlacklistEntryWarning(correspondingBlacklistEntry);
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/scam-prevention': ScamPrevention;
  }
}
