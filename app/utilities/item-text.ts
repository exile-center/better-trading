const SEPARATOR = '--------';
const ITEM_CLASS_SELECTOR = '.item-popup__property > .lc[type]:not([data-field])';
const PROPERTY_SELECTOR = '.property, .displayProperty, .item-popup__property';
const REQUIREMENTS_SELECTOR = '.requirements, .item-popup__property--requirements';
// The trade popup uses singular class labels; copied equipment uses these names.
const ITEM_CLASSES: Record<string, string> = {
  Amulet: 'Amulets',
  Belt: 'Belts',
  'Body Armour': 'Body Armours',
  Bow: 'Bows',
  Buckler: 'Bucklers',
  Charm: 'Charms',
  Claw: 'Claws',
  Crossbow: 'Crossbows',
  Dagger: 'Daggers',
  Flail: 'Flails',
  Focus: 'Foci',
  Helmet: 'Helmets',
  Jewel: 'Jewels',
  'Life Flask': 'Life Flasks',
  'Mana Flask': 'Mana Flasks',
  'One Hand Axe': 'One Hand Axes',
  'One Hand Mace': 'One Hand Maces',
  'One Hand Sword': 'One Hand Swords',
  Quarterstaff: 'Quarterstaves',
  Quiver: 'Quivers',
  Relic: 'Relics',
  Ring: 'Rings',
  Sceptre: 'Sceptres',
  Shield: 'Shields',
  Spear: 'Spears',
  Staff: 'Staves',
  Talisman: 'Talismans',
  'Two Hand Axe': 'Two Hand Axes',
  'Two Hand Mace': 'Two Hand Maces',
  'Two Hand Sword': 'Two Hand Swords',
  Wand: 'Wands',
  Waystone: 'Waystones',
};
const RARITIES = [
  ['.normalPopup, .item-popup--normal', 'Normal'],
  ['.magicPopup, .item-popup--magic', 'Magic'],
  ['.rarePopup, .item-popup--rare, .item-popup--runic-rare', 'Rare'],
  ['.uniquePopup, .item-popup--unique, .item-popup--runic-unique', 'Unique'],
  ['.gemPopup, .item-popup--gem', 'Gem'],
  ['.currencyPopup, .item-popup--currency', 'Currency'],
];
const MODIFIERS = [
  ['.enchantMod, .item-mod--enchant', 'enchant'],
  ['.runeMod, .item-mod--rune', 'rune'],
  ['.implicitMod, .item-mod--implicit', 'implicit'],
  ['.fracturedMod, .item-mod--fractured', 'fractured'],
  ['.craftedMod, .item-mod--crafted', 'crafted'],
  ['.desecratedMod, .item-mod--desecrated', 'desecrated'],
  ['.mutatedMod, .item-mod--mutated', 'vaal'],
];
const MOD_SELECTOR = ['.item-mod', '.explicitMod', ...MODIFIERS.map(([selector]) => selector)].join(', ');
const CONTENT_BLOCK_SELECTOR = `${MOD_SELECTOR}, ${PROPERTY_SELECTOR}, ${REQUIREMENTS_SELECTOR}, .itemLevel, .itemNote`;

const readText = (element: Element): string => {
  const clone = element.cloneNode(true) as Element;
  // Advanced mod labels and roll ranges are trade UI, not part of the item text.
  clone.querySelectorAll('.lc.l, .lc.r').forEach((node) => node.remove());
  clone.querySelectorAll('br').forEach((node) => node.replaceWith('\u0000'));

  return (clone.textContent || '')
    .split('\u0000')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
};

const readRequirements = (element: Element): string => {
  const requirements = [
    ['lvl', 'Level'],
    ['str', 'Str'],
    ['dex', 'Dex'],
    ['int', 'Int'],
  ]
    .map(([field, label]) => {
      const requirement = element.querySelector(`[data-field="${field}"]`);
      const value = requirement && readText(requirement).match(/\d+/);
      return value ? `${label}: ${value[0]}` : '';
    })
    .filter(Boolean);

  return requirements.length ? ['Requirements:', ...requirements].join('\n') : readText(element);
};

const readProperty = (element: Element): string => {
  const text = readText(element);
  return element.querySelector('.colourAugmented, [style*="colour-augmented"], [style*="colour-value-augmented"]')
    ? `${text} (augmented)`
    : text;
};

const readModifier = (element: Element): string => {
  const text = readText(element.querySelector('.s') || element);
  const modifier = MODIFIERS.find(([selector]) => element.matches(selector));
  if (!modifier || !text) return text;

  return text
    .split('\n')
    .map((line) => `${line} (${modifier[1]})`)
    .join('\n');
};

const readContent = (element: Element): string => {
  if (element.matches(REQUIREMENTS_SELECTOR)) return readRequirements(element);
  if (element.matches(MOD_SELECTOR)) return readModifier(element);
  if (element.matches(PROPERTY_SELECTOR)) return readProperty(element);

  return readText(element);
};

const readHeader = (popup: Element): string | null => {
  const rarity = RARITIES.find(([selector]) => popup.matches(selector));
  const names = Array.from(popup.querySelectorAll('.itemHeader .itemName, .item-popup__header-line'))
    .map(readText)
    .filter(Boolean);
  if (!rarity || names.length === 0) return null;

  const lines = [`Rarity: ${rarity[1]}`, ...names];
  const itemClassElement = popup.querySelector(ITEM_CLASS_SELECTOR);
  if (itemClassElement) {
    const itemClass = readText(itemClassElement);
    lines.unshift(`Item Class: ${ITEM_CLASSES[itemClass] || itemClass}`);
  }

  return lines.join('\n');
};

const contentBlocks = (content: Element): Element[] => {
  return Array.from(content.children).reduce<Element[]>((blocks, element) => {
    if (!element.matches(CONTENT_BLOCK_SELECTOR) && element.querySelector(CONTENT_BLOCK_SELECTOR)) {
      return [...blocks, ...contentBlocks(element)];
    }

    return [...blocks, element];
  }, []);
};

const findPopup = (itemElement: HTMLElement): Element | null => {
  return itemElement.querySelector('.middle .item-popup') || itemElement.querySelector('.middle .itemPopupContainer');
};

const isItemNote = (element: Element): boolean => {
  return element.matches('.itemNote') || /^~(?:b\/o|price)\s/.test(readText(element));
};

const takeSection = (
  blocks: Set<Element>,
  matches: (element: Element) => boolean,
  read: (element: Element) => string = readContent
): string => {
  return Array.from(blocks)
    .filter(matches)
    .map((element) => {
      blocks.delete(element);
      return read(element);
    })
    .filter(Boolean)
    .join('\n');
};

const readSections = (blocks: Set<Element>): string[] => {
  const sections: string[] = [];
  let lines: string[] = [];
  const flushSection = () => {
    if (lines.length) sections.push(lines.join('\n'));
    lines = [];
  };

  blocks.forEach((element) => {
    if (element.matches('.separator, .item-popup__separator')) {
      flushSection();
      return;
    }
    const text = readContent(element);
    if (text) lines.push(text);
  });
  flushSection();

  return sections;
};

const readSockets = (itemElement: HTMLElement): string => {
  const socketCount = itemElement.querySelectorAll('.left .sockets .socket').length;
  return socketCount ? `Sockets: ${Array(socketCount).fill('S').join(' ')}` : '';
};

// PoE2 may omit item.extended.text, which the trade site's native copy button needs.
// Read the rendered item at click time so refreshed listings use their current stats.
export const itemText = (itemElement: HTMLElement): string | null => {
  const popup = findPopup(itemElement);
  const content = popup?.querySelector('.item-popup__content, .content');
  if (!popup || !content) return null;

  const header = readHeader(popup);
  if (!header) return null;

  const blocks = new Set(contentBlocks(content).filter((element) => !element.querySelector(ITEM_CLASS_SELECTOR)));
  const notes = takeSection(blocks, isItemNote, (element) => `Note: ${readText(element)}`);
  const requirements = takeSection(blocks, (element) => element.matches(REQUIREMENTS_SELECTOR));
  const itemLevel = takeSection(
    blocks,
    (element) => element.matches('.itemLevel') || Boolean(element.querySelector('[data-field="ilvl"]'))
  );
  const properties = takeSection(blocks, (element) => element.matches(PROPERTY_SELECTOR));

  // The popup can put item level beside requirements. Native item text separates
  // them and puts requirements (and sockets) before item level.
  return [header, properties, requirements, readSockets(itemElement), itemLevel, ...readSections(blocks), notes]
    .filter(Boolean)
    .join(`\n${SEPARATOR}\n`);
};
