// Vendor
import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import formatDistance from 'date-fns/formatDistance';
import enUS from 'date-fns/locale/en-US';

// Config
import config from 'better-trading/config/environment';

// Types
import TheForbiddenTrove from 'better-trading/services/the-forbidden-trove';

export default class TheForbiddenTroveModals extends Component {
  @service('the-forbidden-trove')
  theForbiddenTrove: TheForbiddenTrove;

  tftDiscordUrl = config.APP.tftDiscordUrl;

  get warnedBlacklistEntry() {
    return this.theForbiddenTrove.warnedBlacklistEntry;
  }

  get formattedBlacklistedOn() {
    if (!this.warnedBlacklistEntry) return null;

    return formatDistance(new Date(this.warnedBlacklistEntry.blacklistedOn), new Date(), {
      addSuffix: true,
      includeSeconds: true,
      locale: enUS,
    });
  }

  @action
  clearBlacklistEntryWarning() {
    this.theForbiddenTrove.clearBlacklistEntryWarning();
  }
}
