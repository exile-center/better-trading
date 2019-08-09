export interface FavoritesFolder {
  title: string;
  items: FavoritesItem[];
  isExpanded: boolean;
}

export interface FavoritesItem {
  title: string;
  slug: string;
}
