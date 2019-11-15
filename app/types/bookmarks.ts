export interface BookmarksTradeLocation {
  type: string;
  slug: string;
}

export interface BookmarksTradeStruct {
  id: string;
  title: string;
  color: string | null;
  location: BookmarksTradeLocation;
  folderId: string;
}

export interface BookmarksFolderStruct {
  id: string;
  title: string;
  icon: string | null;
}
