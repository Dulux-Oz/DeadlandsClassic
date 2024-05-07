import { ShowEdgeSheet } from '../sheets/show-edge-sheet.mjs';
import { ShowGunSheet } from '../sheets/show-gun-sheet.mjs';
import { ShowMeleeSheet } from '../sheets/show-melee-sheet.mjs';
import { ShowMiscItemSheet } from '../sheets/show-misc-item-sheet.mjs';
import { ShowOtherRangedSheet } from '../sheets/show-other-ranged-sheet.mjs';

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

  Items.registerSheet('deadlands-classic', ShowOtherRangedSheet, {
    types: ['otherRanged'],
    makeDefault: true,
    label: 'DLC.sheet-type.otherRanged',
  });
}
