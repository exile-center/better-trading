// Vendor
import Component from '@glimmer/component';

// Types
import {
  BookmarksFolderIcon,
  BookmarksFolderPoE1ItemIcon,
  BookmarksFolderPoE2ItemIcon,
} from 'better-trading/types/bookmarks';

interface Args {
  icon: BookmarksFolderIcon;
}

export default class BookmarkFolderIcon extends Component<Args> {
  get iconPath() {
    return `bookmark-folder/${this.args.icon}.png`;
  }

  get iconIsItem() {
    const itemIcons: BookmarksFolderIcon[] = [
      ...Object.values(BookmarksFolderPoE1ItemIcon),
      ...Object.values(BookmarksFolderPoE2ItemIcon),
    ];

    return itemIcons.includes(this.args.icon);
  }
}
