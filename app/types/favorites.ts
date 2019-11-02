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

export interface RawFavoritesFolder {
  title: string;
  items: RawFavoritesItem[];
  isExpanded: boolean;
}

export interface RawFavoritesTrade {
  title: string;
  slug: string;
}

export type RawFavoritesItem = RawFavoritesFolder | RawFavoritesTrade;
