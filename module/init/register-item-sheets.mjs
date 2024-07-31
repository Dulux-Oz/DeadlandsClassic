import { ShowEdgeSheet } from '../sheets/item/show-sheet-edge.mjs';
import { ShowGunSheet } from '../sheets/item/show-sheet-gun.mjs';
import { ShowMeleeSheet } from '../sheets/item/show-sheet-melee.mjs';
import { ShowMiscItemSheet } from '../sheets/item/show-sheet-misc-item.mjs';
import { ShowOtherRangedItemSheet } from '../sheets/item/show-sheet-other-ranged-item.mjs';

export function registerItemSheets() {
  Items.unregisterSheet('core', ItemSheet);

  Items.registerSheet('deadlands-classic', ShowEdgeSheet, {
    types: ['edge', 'hindrance', 'spellLike'],
    makeDefault: true,
    label: 'DLC.sheet-type.edge',
  });

  Items.registerSheet('deadlands-classic', ShowGunSheet, {
    types: ['gun'],
    makeDefault: true,
    label: 'DLC.sheet-type.gun',
  });

  Items.registerSheet('deadlands-classic', ShowMeleeSheet, {
    types: ['melee'],
    makeDefault: true,
    label: 'DLC.sheet-type.melee',
  });

  Items.registerSheet('deadlands-classic', ShowMiscItemSheet, {
    types: ['miscItem'],
    makeDefault: true,
    label: 'DLC.sheet-type.miscItem',
  });

  Items.registerSheet('deadlands-classic', ShowOtherRangedItemSheet, {
    types: ['otherRanged'],
    makeDefault: true,
    label: 'DLC.sheet-type.otherRanged',
  });
}
