// Vendor
import Component from '@glimmer/component';

// Types
import {BookmarksFolderStruct} from 'better-trading/types/bookmarks';

interface Args {
  folder: BookmarksFolderStruct;
  tradesCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default class FolderDeletion extends Component<Args> {}
