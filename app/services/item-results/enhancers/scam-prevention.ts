// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';
import TheForbiddenTrove from 'better-trading/services/the-forbidden-trove';
import {TheForbbidenTroveBlacklistEntry} from 'better-trading/types/the-forbidden-trove';

export default class ScamPrevention extends Service implements ItemResultsEnhancerService {
  @service('the-forbidden-trove')
  theForbiddenTrove: TheForbiddenTrove;

  private blacklistEntries: TheForbbidenTroveBlacklistEntry[];

  async prepare() {
    this.blacklistEntries = await this.theForbiddenTrove.fetchBlacklist();
  }

  // eslint-disable-next-line complexity
  enhance(result: HTMLElement) {
    const pmButtonElement = result.querySelector<HTMLAnchorElement>('a.pm-btn');
    const whisperButtonElement = result.querySelector<HTMLButtonElement>('button.whisper-btn');
    const characterNameElement = result.querySelector<HTMLSpanElement>('.character-name');

    if (!pmButtonElement || !whisperButtonElement || !characterNameElement) return;

    const match = pmButtonElement.href.match(/compose\?to=(.+)$/);
    if (!match) return;

    const [, accountName] = match;

    const correspondingBlacklistEntry = this.blacklistEntries.find(
      (blacklistEntry) => blacklistEntry.accountName.toLowerCase() === accountName.toLowerCase()
    );
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
