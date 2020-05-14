// Vendor
import Component from '@glimmer/component';

// Types
import {BookmarksFolderIcon, BookmarksFolderItemIcon} from 'better-trading/types/bookmarks';

interface Args {
  icon: BookmarksFolderIcon;
}

export default class BookmarkFolderIcon extends Component<Args> {
  get iconPath() {
    return `bookmark-folder/${this.args.icon}.png`;
  }

  get iconIsItem() {
    return (Object.values(BookmarksFolderItemIcon) as string[]).includes(this.args.icon);
  }
}
