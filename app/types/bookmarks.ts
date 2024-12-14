import type {TradeSiteVersion} from 'better-trading/types/trade-location';

export interface BookmarksTradeLocation {
  version: TradeSiteVersion;
  type: string;
  slug: string;
}

export interface PartialBookmarksTradeLocation {
  version: TradeSiteVersion;
  type: string | null;
  slug: string | null;
}

export interface BookmarksTradeStruct {
  id?: string;
  title: string;
  location: BookmarksTradeLocation;
  completedAt: string | null;
}

export interface BookmarksFolderStruct {
  id?: string;
  title: string;
  icon: BookmarksFolderIcon | null;
  archivedAt: string | null;
}

export type BookmarksFolderIcon = BookmarksFolderAscendancyIcon | BookmarksFolderItemIcon;

export enum BookmarksFolderAscendancyDuelistIcon {
  SLAYER = 'slayer',
  GLADIATOR = 'gladiator',
  CHAMPION = 'champion',
}

export enum BookmarksFolderAscendancyShadowIcon {
  ASSASSIN = 'assassin',
  SABOTEUR = 'saboteur',
  TRICKSTER = 'trickster',
}

export enum BookmarksFolderAscendancyMarauderIcon {
  JUGGERNAUT = 'juggernaut',
  BERSERKER = 'berserker',
  CHIEFTAIN = 'chieftain',
}

export enum BookmarksFolderAscendancyWitchIcon {
  NECROMANCER = 'necromancer',
  ELEMENTALIST = 'elementalist',
  OCCULTIST = 'occultist',
}

export enum BookmarksFolderAscendancyRangerIcon {
  DEADEYE = 'deadeye',
  RAIDER = 'raider',
  PATHFINDER = 'pathfinder',
}

export enum BookmarksFolderAscendancyTemplarIcon {
  GUARDIAN = 'guardian',
  HIEROPHANT = 'hierophant',
  INQUISITOR = 'inquisitor',
}

export enum BookmarksFolderAscendancyScionIcon {
  ASCENDANT = 'ascendant',
}

export type BookmarksFolderAscendancyIcon =
  | BookmarksFolderAscendancyDuelistIcon
  | BookmarksFolderAscendancyShadowIcon
  | BookmarksFolderAscendancyMarauderIcon
  | BookmarksFolderAscendancyWitchIcon
  | BookmarksFolderAscendancyRangerIcon
  | BookmarksFolderAscendancyTemplarIcon
  | BookmarksFolderAscendancyScionIcon;

export enum BookmarksFolderItemIcon {
  ALCHEMY = 'alchemy',
  CHAOS = 'chaos',
  EXALT = 'exalt',
  DIVINE = 'divine',
  MIRROR = 'mirror',
  CARD = 'card',
  ESSENCE = 'essence',
  FOSSIL = 'fossil',
  MAP = 'map',
  SCARAB = 'scarab',
}
