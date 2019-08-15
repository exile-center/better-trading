export interface FavoritesFolder {
  title: string;
  items: FavoritesItem[];
  isExpanded: boolean;
}

export interface FavoritesTrade {
  title: string;
  slug: string;
}

export type FavoritesItem = FavoritesFolder | FavoritesTrade;
