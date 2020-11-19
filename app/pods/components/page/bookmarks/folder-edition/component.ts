// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {
  BookmarksFolderAscendancyDuelistIcon,
  BookmarksFolderAscendancyIcon,
  BookmarksFolderAscendancyMarauderIcon,
  BookmarksFolderAscendancyRangerIcon,
  BookmarksFolderAscendancyScionIcon,
  BookmarksFolderAscendancyShadowIcon,
  BookmarksFolderAscendancyTemplarIcon,
  BookmarksFolderAscendancyWitchIcon,
  BookmarksFolderItemIcon,
  BookmarksFolderStruct,
} from 'better-trading/types/bookmarks';

interface Args {
  folder: BookmarksFolderStruct;
  onCancel: () => void;
  submitTask: any;
}

export default class BookmarksFolderEdition extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  folder: BookmarksFolderStruct = this.args.folder;

  get iconAscendancyOptions() {
    return [
      Object.values(BookmarksFolderAscendancyDuelistIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarksFolderAscendancyShadowIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarksFolderAscendancyMarauderIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarksFolderAscendancyWitchIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarksFolderAscendancyRangerIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarksFolderAscendancyTemplarIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarksFolderAscendancyScionIcon).map(this.iconOptionFromIcon),
    ];
  }

  get iconItemOptions() {
    return Object.values(BookmarksFolderItemIcon).map(this.iconOptionFromIcon);
  }

  get canSubmit() {
    return Boolean(this.folder.title);
  }

  @action
  changeTitle(title: string) {
    this.folder = {...this.folder, title};
  }

  @action
  toggleIcon(icon: BookmarksFolderAscendancyIcon | BookmarksFolderItemIcon) {
    this.folder = {
      ...this.folder,
      icon: icon !== this.folder.icon ? icon : null,
    };
  }

  private iconOptionFromIcon(icon: BookmarksFolderAscendancyIcon | BookmarksFolderItemIcon) {
    return {
      value: icon,
      imagePath: `bookmark-folder/${icon}.png`,
    };
  }
}
