import {ParsedItem, ParsedMod, ModTag} from 'better-trading/types/item-parser';

const SEPARATOR = '--------';
const ADVANCED_MOD_REGEX = /^\{ (Prefix|Suffix|Implicit|Unique) Modifier "([^"]*)"(?: \(Tier: (\d+)\))?(?: — .*)? \}$/;
const NUMBER_REGEX = /[+-]?\d+(?:\.\d+)?/g;
// Matches advanced format range notations: "12(8-12)", "12 (8-12)", "12%(8-12)"
const RANGE_VALUE_REGEX = /(\d+(?:\.\d+)?(%?))\s*\([\d.]+[-–][\d.]+\)/g;
const MOD_TAG_REGEX = /\s*\((implicit|crafted|fractured|enchant|rune|desecrated)\)\s*$/;

export function parseItemText(text: string): ParsedItem | null {
  if (!text || !text.trim()) return null;

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const sections = normalized.split(`\n${SEPARATOR}\n`);

  if (sections.length < 2) return null;

  const result: ParsedItem = {
    raw: text,
    itemClass: null,
    rarity: null,
    name: null,
    baseType: null,
    itemLevel: null,
    quality: null,
    sockets: null,
    corrupted: false,
    mirrored: false,
    unidentified: false,
    fractured: false,
    implicits: [],
    explicits: [],
  };

  // Parse header section (first section)
  parseHeader(sections[0], result);
  if (!result.rarity) return null;

  // Parse remaining sections
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    parseSection(section, result);
  }

  return result;
}

function parseHeader(header: string, result: ParsedItem): void {
  const lines = header.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('Item Class: ')) {
      result.itemClass = line.substring('Item Class: '.length).trim();
    } else if (line.startsWith('Rarity: ')) {
      result.rarity = line.substring('Rarity: '.length).trim();
    }
  }

  // Name and base type depend on rarity
  const nonMetaLines = lines.filter(
    (l) => !l.startsWith('Item Class:') && !l.startsWith('Rarity:')
  );

  if (result.rarity === 'Rare' || result.rarity === 'Unique') {
    if (nonMetaLines.length >= 2) {
      result.name = nonMetaLines[0];
      result.baseType = nonMetaLines[1];
    } else if (nonMetaLines.length === 1) {
      result.baseType = nonMetaLines[0];
    }
  } else if (result.rarity === 'Magic') {
    // Magic items: name includes affixes + base, stored as name
    if (nonMetaLines.length >= 1) {
      result.name = nonMetaLines[0];
      result.baseType = nonMetaLines[0];
    }
  } else {
    // Normal, Currency, Gem, Divination Card
    if (nonMetaLines.length >= 1) {
      result.baseType = nonMetaLines[0];
    }
  }
}

function parseSection(section: string, result: ParsedItem): void {
  const lines = section.split('\n').map((l) => l.trim());
  const firstLine = lines[0] || '';

  // Item Level
  if (firstLine.startsWith('Item Level: ')) {
    result.itemLevel = parseInt(firstLine.substring('Item Level: '.length), 10) || null;
    return;
  }

  // Quality
  if (firstLine.startsWith('Quality')) {
    const match = firstLine.match(/Quality[^:]*:\s*\+(\d+)%/);
    if (match) {
      result.quality = parseInt(match[1], 10);
    }
    // If section has more lines, they're defense/offense stats - skip
    return;
  }

  // Sockets
  if (firstLine.startsWith('Sockets: ')) {
    result.sockets = firstLine.substring('Sockets: '.length).trim();
    return;
  }

  // Requirements
  if (firstLine.startsWith('Requirements:') || firstLine.startsWith('Requires:')) {
    return;
  }

  // Status flags
  if (firstLine === 'Corrupted') {
    result.corrupted = true;
    return;
  }
  if (firstLine === 'Mirrored') {
    result.mirrored = true;
    return;
  }
  if (firstLine === 'Unidentified') {
    result.unidentified = true;
    return;
  }
  if (firstLine === 'Fractured Item') {
    result.fractured = true;
    return;
  }

  // Defense/Offense stats (Armour, Evasion, Energy Shield, Physical Damage, etc.)
  if (isDefenseOrOffenseSection(lines)) {
    // Also check for quality line that precedes defense stats
    for (const line of lines) {
      if (line.startsWith('Quality')) {
        const match = line.match(/Quality[^:]*:\s*\+(\d+)%/);
        if (match) result.quality = parseInt(match[1], 10);
      }
    }
    return;
  }

  // Note line (priced items)
  if (firstLine.startsWith('Note: ')) return;

  // Flavour text detection: if rarity is Unique and this section doesn't look like mods
  // Skip flavour text (usually italic lore) - detect by checking if lines have no numeric values
  // and no mod-like structure
  if (result.rarity === 'Unique' && isFlavourText(lines)) return;

  // Placeholder text (e.g., "Place into an allocated Jewel Socket...")
  if (isPlaceholderText(firstLine)) return;

  // Everything else: mods section
  parseMods(lines, result);
}

function isDefenseOrOffenseSection(lines: string[]): boolean {
  const defenseOffensePatterns = [
    /^(Armour|Evasion Rating|Energy Shield|Ward):/,
    /^(Physical Damage|Elemental Damage|Chaos Damage|Cold Damage|Fire Damage|Lightning Damage):/,
    /^(Critical (Strike|Hit) Chance|Attacks per Second|Weapon Range):/,
    /^(Dagger|Sword|Axe|Mace|Sceptre|Staff|Wand|Bow|Claw|One Handed|Two Handed|Quarterstaff)/,
  ];

  return lines.some((line) =>
    defenseOffensePatterns.some((p) => p.test(line))
  );
}

function isFlavourText(lines: string[]): boolean {
  const modKeywords = /(?:increased |reduced |more |less |regenerate|adds |grants? |enemies |hits |cannot |you have |per second|chance to |while |during |with |nearby|leech|damage|resistance|modifier)/i;

  return lines.every((line) => {
    if (!line) return true;
    if (ADVANCED_MOD_REGEX.test(line)) return false;
    if (MOD_TAG_REGEX.test(line)) return false;
    // Lines with numbers + mod keywords are mods
    if (/[+-]?\d+/.test(line) && modKeywords.test(line)) return false;
    // Lines without numbers but with mod keywords are also mods (e.g. "Hits cannot be Evaded")
    if (modKeywords.test(line)) return false;
    return true;
  });
}

function isPlaceholderText(line: string): boolean {
  return (
    line.startsWith('Place into') ||
    line.startsWith('Right click') ||
    line.startsWith('Take this item') ||
    line.startsWith('Can be used')
  );
}

function parseMods(lines: string[], result: ParsedItem): void {
  let currentAdvancedMeta: {modType: 'prefix' | 'suffix' | 'implicit' | 'unique'; modName: string; tier: number | undefined} | null = null;
  let allImplicit = false;

  // Check if ALL lines in this section have (implicit) tag — if so, it's an implicit section
  const modLines = lines.filter((l) => l && !ADVANCED_MOD_REGEX.test(l) && !l.startsWith('('));
  allImplicit = modLines.length > 0 && modLines.every((l) => MOD_TAG_REGEX.test(l) && l.match(MOD_TAG_REGEX)?.[1] === 'implicit');

  for (const line of lines) {
    if (!line) continue;

    // Skip parenthetical notes in advanced format (e.g., "(Added Passive Skills are never considered...)")
    if (line.startsWith('(') && !MOD_TAG_REGEX.test(line)) continue;

    // Check for advanced format metadata line
    const advancedMatch = line.match(ADVANCED_MOD_REGEX);
    if (advancedMatch) {
      const typeStr = advancedMatch[1].toLowerCase();
      currentAdvancedMeta = {
        modType: typeStr as 'prefix' | 'suffix' | 'implicit' | 'unique',
        modName: advancedMatch[2],
        tier: advancedMatch[3] ? parseInt(advancedMatch[3], 10) : undefined,
      };
      continue;
    }

    // This is a mod line
    const mod = parseModLine(line, currentAdvancedMeta, allImplicit);
    if (!mod) continue;

    if (mod.tag === 'implicit') {
      result.implicits.push(mod);
    } else {
      result.explicits.push(mod);
    }

    // Reset advanced meta after consuming it
    currentAdvancedMeta = null;
  }
}

function parseModLine(
  line: string,
  advancedMeta: {modType: 'prefix' | 'suffix' | 'implicit' | 'unique'; modName: string; tier: number | undefined} | null,
  allImplicit: boolean
): ParsedMod | null {
  let tag: ModTag = 'explicit';
  let modText = line;

  // Extract tag from parenthetical suffix
  const tagMatch = modText.match(MOD_TAG_REGEX);
  if (tagMatch) {
    tag = tagMatch[1] as ModTag;
    modText = modText.replace(MOD_TAG_REGEX, '').trim();
  } else if (allImplicit) {
    tag = 'implicit';
  }

  // Handle advanced format: strip range notations like +12(8-12)% → +12%
  modText = modText.replace(RANGE_VALUE_REGEX, '$1');

  // If we have advanced metadata, use it to determine tag
  if (advancedMeta) {
    if (advancedMeta.modType === 'implicit') {
      tag = 'implicit';
    } else if (tag === 'explicit') {
      // Keep prefix/suffix as explicit but store metadata
      tag = 'explicit';
    }
  }

  // Extract numeric values
  const values: number[] = [];
  const numberMatches = modText.match(NUMBER_REGEX);
  if (numberMatches) {
    for (const n of numberMatches) {
      values.push(parseFloat(n));
    }
  }

  // Normalize text: replace numbers with #
  const normalizedText = modText.replace(NUMBER_REGEX, '#');

  // Skip lines that are just "Unscalable Value" or similar non-mod text
  if (normalizedText === '— Unscalable Value' || modText === '— Unscalable Value') return null;
  // Skip very short lines that aren't mods
  if (modText.length < 3) return null;

  const mod: ParsedMod = {
    text: modText,
    normalizedText,
    values,
    tag,
  };

  if (advancedMeta) {
    mod.modType = advancedMeta.modType;
    mod.modName = advancedMeta.modName;
    mod.tier = advancedMeta.tier;
  }

  return mod;
}
