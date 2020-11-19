// Vendor
import Component from '@glimmer/component';
import formatDistance from 'date-fns/formatDistance';
import enUS from 'date-fns/locale/en-US';

// Types
import {TradeLocationHistoryStruct} from 'better-trading/types/trade-location';

interface Args {
  historyEntry: TradeLocationHistoryStruct;
}

export default class EntryLink extends Component<Args> {
  get formattedCreatedAt() {
    // eslint-disable-next-line no-magic-numbers
    return formatDistance(new Date(this.args.historyEntry.createdAt), new Date(), {
      addSuffix: true,
      includeSeconds: true,
      locale: enUS,
    });
  }

  get formattedSlug() {
    return [this.args.historyEntry.type, this.args.historyEntry.league, this.args.historyEntry.slug].join('/');
  }
}
