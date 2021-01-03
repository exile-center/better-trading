// Vendor
import Service from '@ember/service';

// Types
import {BookmarksFolderIcon, BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface ExportedFolderStruct {
  icn: string;
  tit: string;
  trs: Array<{
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
        tit: trade.title,
        loc: `${trade.location.type}:${trade.location.slug}`,
      })),
    };

    return btoa(JSON.stringify(payload));
  }

  deserialize(serializedFolder: string): [BookmarksFolderStruct, BookmarksTradeStruct[]] | null {
    try {
      const potentialPayload: ExportedFolderStruct = JSON.parse(atob(serializedFolder));

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
