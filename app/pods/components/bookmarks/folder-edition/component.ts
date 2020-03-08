// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {
  BookmarkFolderAscendancyDuelistIcon,
  BookmarkFolderAscendancyIcon,
  BookmarkFolderAscendancyMarauderIcon,
  BookmarkFolderAscendancyRangerIcon,
  BookmarkFolderAscendancyScionIcon,
  BookmarkFolderAscendancyShadowIcon,
  BookmarkFolderAscendancyTemplarIcon,
  BookmarkFolderAscendancyWitchIcon,
  BookmarkFolderItemIcon,
  BookmarksFolderStruct
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
      Object.values(BookmarkFolderAscendancyDuelistIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarkFolderAscendancyShadowIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarkFolderAscendancyMarauderIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarkFolderAscendancyWitchIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarkFolderAscendancyRangerIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarkFolderAscendancyTemplarIcon).map(this.iconOptionFromIcon),
      Object.values(BookmarkFolderAscendancyScionIcon).map(this.iconOptionFromIcon)
    ];
  }

  get iconItemOptions() {
    return Object.values(BookmarkFolderItemIcon).map(this.iconOptionFromIcon);
  }

  @action
  changeTitle(title: string) {
    this.folder = {...this.folder, title};
  }

  @action
  toggleIcon(icon: BookmarkFolderAscendancyIcon | BookmarkFolderItemIcon) {
    this.folder = {
      ...this.folder,
      icon: icon !== this.folder.icon ? icon : null
    };
  }

  private iconOptionFromIcon(icon: BookmarkFolderAscendancyIcon | BookmarkFolderItemIcon) {
    return {
      value: icon,
      imagePath: `bookmark-folder/${icon}.png`
    };
  }
}
