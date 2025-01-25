// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import TradeLocation from 'better-trading/services/trade-location';
import {
  BookmarksFolderAscendancyDuelistIcon,
  BookmarksFolderAscendancyMarauderIcon,
  BookmarksFolderAscendancyRangerIcon,
  BookmarksFolderAscendancyScionIcon,
  BookmarksFolderAscendancyShadowIcon,
  BookmarksFolderAscendancyTemplarIcon,
  BookmarksFolderAscendancyWitchIcon,
  BookmarksFolderAscendancyPoE2RangerIcon,
  BookmarksFolderAscendancyPoE2WarriorIcon,
  BookmarksFolderAscendancyPoE2WitchIcon,
  BookmarksFolderAscendancyPoE2SorceressIcon,
  BookmarksFolderAscendancyPoE2MercenaryIcon,
  BookmarksFolderAscendancyPoE2MonkIcon,
  BookmarksFolderPoE1ItemIcon,
  BookmarksFolderPoE2ItemIcon,
  BookmarksFolderStruct,
  BookmarksFolderIcon,
} from 'better-trading/types/bookmarks';

const POE1_ASCENDANCY_ICONS: Array<Record<string, BookmarksFolderIcon>> = [
  BookmarksFolderAscendancyDuelistIcon,
  BookmarksFolderAscendancyShadowIcon,
  BookmarksFolderAscendancyMarauderIcon,
  BookmarksFolderAscendancyWitchIcon,
  BookmarksFolderAscendancyRangerIcon,
  BookmarksFolderAscendancyTemplarIcon,
  BookmarksFolderAscendancyScionIcon,
];

const POE2_ASCENDANCY_ICONS: Array<Record<string, BookmarksFolderIcon>> = [
  BookmarksFolderAscendancyPoE2WarriorIcon,
  BookmarksFolderAscendancyPoE2WitchIcon,
  BookmarksFolderAscendancyPoE2RangerIcon,
  BookmarksFolderAscendancyPoE2SorceressIcon,
  BookmarksFolderAscendancyPoE2MercenaryIcon,
  BookmarksFolderAscendancyPoE2MonkIcon,
];

interface Args {
  folder: BookmarksFolderStruct;
  onCancel: () => void;
  submitTask: any;
}

export default class BookmarksFolderEdition extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('trade-location')
  tradeLocation: TradeLocation;

  @tracked
  folder: BookmarksFolderStruct = this.args.folder;

  get iconAscendancyOptions() {
    const icons = this.tradeLocation.version === '2' ? POE2_ASCENDANCY_ICONS : POE1_ASCENDANCY_ICONS;
    return icons.map((iconGroupEnum) => {
      return Object.values(iconGroupEnum).map(this.iconOptionFromIcon);
    });
  }

  get iconItemOptions() {
    const icons = this.tradeLocation.version === '2' ? BookmarksFolderPoE2ItemIcon : BookmarksFolderPoE1ItemIcon;
    return Object.values(icons).map(this.iconOptionFromIcon);
  }

  get canSubmit() {
    return Boolean(this.folder.title);
  }

  @action
  changeTitle(title: string) {
    this.folder = {...this.folder, title};
  }

  @action
  toggleIcon(icon: BookmarksFolderIcon) {
    this.folder = {
      ...this.folder,
      icon: icon !== this.folder.icon ? icon : null,
    };
  }

  private iconOptionFromIcon(icon: BookmarksFolderIcon) {
    return {
      value: icon,
      imagePath: `bookmark-folder/${icon}.png`,
    };
  }
}
