// Vendor
import Service from '@ember/service';

// Types
import {BookmarksFolderIcon, BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface ExportedFolderStruct {
  icn: string;
  tit: string;
  trs: Array<{
    url?: string;
    tit: string;
    loc: string;
  }>;
}

export default class Export extends Service {
  serialize(folder: BookmarksFolderStruct, trades: BookmarksTradeStruct[]): string {
    const payload: ExportedFolderStruct = {
      icn: folder.icon as string,
      tit: folder.title,
      trs: trades.map((trade) => ({
        url: trade.location.baseUrl,
        tit: trade.title,
        loc: `${trade.location.type}:${trade.location.slug}`,
      })),
    };

    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  deserialize(serializedFolder: string): [BookmarksFolderStruct, BookmarksTradeStruct[]] | null {
    try {
      const potentialPayload: ExportedFolderStruct = JSON.parse(decodeURIComponent(escape(atob(serializedFolder))));

      const folder: BookmarksFolderStruct = {
        icon: potentialPayload.icn as BookmarksFolderIcon,
        title: potentialPayload.tit,
        archivedAt: null,
      };

      const trades: BookmarksTradeStruct[] = potentialPayload.trs.map((trade) => {
        const [type, slug] = trade.loc.split(':');

        return {
          title: trade.tit,
          completedAt: null,
          location: {
            baseUrl: trade.url,
            type,
            slug,
          },
        };
      });

      return [folder, trades];
    } catch (e) {
      return null;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/export': Export;
  }
}
