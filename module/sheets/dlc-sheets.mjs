import { BaseActorSheetDlc } from './character-sheet.mjs';

export function registerSheets() {
  Actors.registerSheet('deadlands-classic', BaseActorSheetDlc, {
    types: ['character'],
    makeDefault: true,
    label: game.i18n.localize('deadlands-classic.sheets.types.character'),
  });
}
