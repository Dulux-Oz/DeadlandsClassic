import { ShowEdgeSheet } from '../sheets/item/show-sheet-edge.mjs';

export function registerItemSheets() {
  Items.unregisterSheet('core', ItemSheet);

  Items.registerSheet('deadlands-classic', ShowEdgeSheet, {
    types: ['edge', 'hindrance', 'spellLike'],
    makeDefault: true,
    label: 'DLC.sheet-type.edge',
  });
}
