import { DLCActorSheet } from '../sheets/dlc-actor-sheet.mjs';

export function registerActorSheets() {
  Actors.registerSheet('deadlands-classic', DLCActorSheet, {
    types: ['character'],
    makeDefault: true,
    label: game.i18n.localize('DLC.sheet-type.character'),
  });
}
