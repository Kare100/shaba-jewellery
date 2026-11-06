// How each product is drawn in 3D. The 3D models are built in code from simple shapes,
// so they need no model files to download (see lib/jewel-scene.ts).
export type JewelKind =
  | 'solitaire' | 'stack' | 'signet'
  | 'pendant' | 'pearls' | 'collar'
  | 'drops' | 'studs' | 'hoops'
  | 'tennis' | 'beads' | 'cuff'

export type Metal = 'silver' | 'gold' | 'copper' | 'brass'

export interface JewelSpec {
  kind: JewelKind
  metal: Metal
  /** Main stone colour (hex). */
  gem?: string
}

export const JEWELS: Record<string, JewelSpec> = {
  'amani-solitaire-ring': { kind: 'solitaire', metal: 'silver', gem: '#f4f8ff' },
  'zawadi-stacking-rings': { kind: 'stack', metal: 'gold' },
  'rubi-signet-ring': { kind: 'signet', metal: 'gold', gem: '#9b1030' },
  'maasai-bead-collar': { kind: 'collar', metal: 'brass' },
  'jua-pendant-necklace': { kind: 'pendant', metal: 'gold' },
  'bahari-pearl-necklace': { kind: 'pearls', metal: 'silver' },
  'nyota-drop-earrings': { kind: 'drops', metal: 'silver', gem: '#2d5bd8' },
  'shaba-hoop-earrings': { kind: 'hoops', metal: 'copper' },
  'lulu-stud-earrings': { kind: 'studs', metal: 'silver' },
  'kito-tennis-bracelet': { kind: 'tennis', metal: 'silver', gem: '#f4f8ff' },
  'safari-bead-bracelet': { kind: 'beads', metal: 'gold' },
  'pwani-cuff-bracelet': { kind: 'cuff', metal: 'brass' },
}

/** The hero piece: a solitaire with a green tsavorite. */
export const HERO_JEWEL: JewelSpec = { kind: 'solitaire', metal: 'gold', gem: '#22b36a' }
