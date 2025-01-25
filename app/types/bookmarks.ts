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
  version: TradeSiteVersion;
  icon: BookmarksFolderIcon | null;
  archivedAt: string | null;
}

export type BookmarksFolderIcon =
  | BookmarksFolderPoE1AscendancyIcon
  | BookmarksFolderPoE1ItemIcon
  | BookmarksFolderPoE2AscendancyIcon
  | BookmarksFolderPoE2ItemIcon;

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

export enum BookmarksFolderAscendancyPoE2WarriorIcon {
  TITAN = 'poe2-titan',
  WARBRINGER = 'poe2-warbringer',
}

export enum BookmarksFolderAscendancyPoE2WitchIcon {
  INFERNALIST = 'poe2-infernalist',
  BLOOD_MAGE = 'poe2-blood-mage',
}

export enum BookmarksFolderAscendancyPoE2RangerIcon {
  DEADEYE = 'poe2-deadeye',
  PATHFINDER = 'poe2-pathfinder',
}

export enum BookmarksFolderAscendancyPoE2SorceressIcon {
  CHRONOMANCER = 'poe2-chronomancer',
  STORMWEAVER = 'poe2-stormweaver',
}

export enum BookmarksFolderAscendancyPoE2MercenaryIcon {
  WITCH_HUNTER = 'poe2-witch-hunter',
  GEMLING_LEGIONNAIRE = 'poe2-gemling-legionnaire',
}

export enum BookmarksFolderAscendancyPoE2MonkIcon {
  INVOKER = 'poe2-invoker',
  ACOLYTE_OF_CHAYULA = 'poe2-acolyte-of-chayula',
}

export type BookmarksFolderPoE1AscendancyIcon =
  | BookmarksFolderAscendancyDuelistIcon
  | BookmarksFolderAscendancyShadowIcon
  | BookmarksFolderAscendancyMarauderIcon
  | BookmarksFolderAscendancyWitchIcon
  | BookmarksFolderAscendancyRangerIcon
  | BookmarksFolderAscendancyTemplarIcon
  | BookmarksFolderAscendancyScionIcon;

export type BookmarksFolderPoE2AscendancyIcon =
  | BookmarksFolderAscendancyPoE2WarriorIcon
  | BookmarksFolderAscendancyPoE2WitchIcon
  | BookmarksFolderAscendancyPoE2RangerIcon
  | BookmarksFolderAscendancyPoE2SorceressIcon
  | BookmarksFolderAscendancyPoE2MercenaryIcon
  | BookmarksFolderAscendancyPoE2MonkIcon;

export enum BookmarksFolderPoE1ItemIcon {
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

export enum BookmarksFolderPoE2ItemIcon {
  ALCHEMY = 'poe2-alchemy',
  ANNUL = 'poe2-annul',
  ARTIFICER = 'poe2-artificer',
  AUGMENT = 'poe2-augment',
  CHANCE = 'poe2-chance',
  CHAOS = 'poe2-chaos',
  DIVINE = 'poe2-divine',
  ESSENCE = 'poe2-essence',
  EXALT = 'poe2-exalt',
  GEMCUTTER = 'poe2-gemcutter',
  GLASSBLOWER = 'poe2-glassblower',
  MIRROR = 'poe2-mirror',
  REGAL = 'poe2-regal',
  RUNE = 'poe2-rune',
  TRANSMUTE = 'poe2-transmute',
  VAAL = 'poe2-vaal',
  WAYSTONE = 'poe2-waystone',
  WISDOM = 'poe2-wisdom',
}
