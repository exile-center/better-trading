// Vendor
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

// Constants
const PREVIEW_BASE_URL = 'https://exile.center/bookmarks-preview';
const PREVIEW_URL_MAX_LENGTH = 7500;

interface Args {
  folder: BookmarksFolderStruct;
  trades: BookmarksTradeStruct[];
  onCancel: () => void;
}

export default class FolderExport extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  get serializedFolder() {
    return this.bookmarks.serializeFolder(this.args.folder, this.args.trades);
  }

  get previewUrl() {
    return `${PREVIEW_BASE_URL}?b64=${this.serializedFolder}`;
  }

  get canPreview() {
    return this.previewUrl.length < PREVIEW_URL_MAX_LENGTH;
  }

  get embedCode() {
    const iframeAttributes = [
      `title="${this.args.folder.title}"`,
      'width="350"',
      'height="500"',
      `src="${this.previewUrl}"`
    ];

    return `<iframe ${iframeAttributes.join(' ')}></iframe>`;
  }
}
