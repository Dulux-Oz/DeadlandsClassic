import { cCharacterData } from './character-data.mjs';
import { BaseActorSheetDlc } from './character-sheet.mjs';
import { cEdgeData } from './edge.mjs';
import { cHindranceData } from './hinderance.mjs';
import { cItemData } from './item.mjs';
import { cNPCData } from './npc.mjs';

export function fpRegisterDataModel() {
  CONFIG.Actor.dataModels.character = cCharacterData;
  CONFIG.Actor.dataModels.npc = cNPCData;
  CONFIG.Item.dataModels.edge = cEdgeData;
  CONFIG.Item.dataModels.hindrance = cHindranceData;
  CONFIG.Item.dataModels.weapon = cItemData;
  Actors.registerSheet('deadlands-classic', BaseActorSheetDlc, {
    types: ['character'],
    makeDefault: true,
    label: game.i18n.localize('deadlands-classic.sheets.types.character'),
  });
}
