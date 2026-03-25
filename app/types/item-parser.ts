export type ModTag = 'implicit' | 'explicit' | 'crafted' | 'fractured' | 'enchant' | 'rune' | 'desecrated';

export interface ParsedMod {
  text: string;
  normalizedText: string; // numbers replaced with #
  values: number[];
  tag: ModTag;
  // Advanced format metadata (Ctrl+Alt+C)
  modType?: 'prefix' | 'suffix' | 'implicit' | 'unique';
  modName?: string;
  tier?: number;
}

export interface ParsedItem {
  raw: string;
  itemClass: string | null;
  rarity: string | null;
  name: string | null;
  baseType: string | null;
  itemLevel: number | null;
  quality: number | null;
  sockets: string | null;
  corrupted: boolean;
  mirrored: boolean;
  unidentified: boolean;
  fractured: boolean;
  implicits: ParsedMod[];
  explicits: ParsedMod[];
}
