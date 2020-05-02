export interface BookmarkTradeLocation {
  type: string;
  slug: string;
}

export interface BookmarkTradeStruct {
  id?: string;
  title: string;
  location: BookmarkTradeLocation;
  completedAt: string | null;
}

export interface BookmarkFolderStruct {
  id?: string;
  title: string;
  icon: BookmarkFolderAscendancyIcon | BookmarkFolderItemIcon | null;
}

export enum BookmarkFolderAscendancyDuelistIcon {
  SLAYER = 'slayer',
  GLADIATOR = 'gladiator',
  CHAMPION = 'champion'
}

export enum BookmarkFolderAscendancyShadowIcon {
  ASSASSIN = 'assassin',
  SABOTEUR = 'saboteur',
  TRICKSTER = 'trickster'
}

export enum BookmarkFolderAscendancyMarauderIcon {
  JUGGERNAUT = 'juggernaut',
  BERSERKER = 'berserker',
  CHIEFTAIN = 'chieftain'
}

export enum BookmarkFolderAscendancyWitchIcon {
  NECROMANCER = 'necromancer',
  ELEMENTALIST = 'elementalist',
  OCCULTIST = 'occultist'
}

export enum BookmarkFolderAscendancyRangerIcon {
  DEADEYE = 'deadeye',
  RAIDER = 'raider',
  PATHFINDER = 'pathfinder'
}

export enum BookmarkFolderAscendancyTemplarIcon {
  GUARDIAN = 'guardian',
  HIEROPHANT = 'hierophant',
  INQUISITOR = 'inquisitor'
}

export enum BookmarkFolderAscendancyScionIcon {
  ASCENDANT = 'ascendant'
}

export type BookmarkFolderAscendancyIcon =
  | BookmarkFolderAscendancyDuelistIcon
  | BookmarkFolderAscendancyShadowIcon
  | BookmarkFolderAscendancyMarauderIcon
  | BookmarkFolderAscendancyWitchIcon
  | BookmarkFolderAscendancyRangerIcon
  | BookmarkFolderAscendancyTemplarIcon
  | BookmarkFolderAscendancyScionIcon;

export enum BookmarkFolderItemIcon {
  ALCHEMY = 'alchemy',
  CHAOS = 'chaos',
  EXALT = 'exalt',
  MIRROR = 'mirror',
  CARD = 'card',
  ESSENCE = 'essence',
  FOSSIL = 'fossil',
  MAP = 'map',
  SCARAB = 'scarab'
}
