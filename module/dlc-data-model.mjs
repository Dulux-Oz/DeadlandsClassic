import { cCharacterData } from './sheets/character-data.mjs';
import { cCharacterSheet } from './sheets/character-sheet.mjs';
import { cEdgeData } from './sheets/edge.mjs';
import { cHindranceData } from './sheets/hinderance.mjs';
import { cItemData } from './sheets/item.mjs';
import { cNPCData } from './sheets/npc.mjs';

export function fpRegisterDataModel() {
  CONFIG.Actor.dataModels.character = cCharacterData;
  CONFIG.Actor.dataModels.npc = cNPCData;
  CONFIG.Item.dataModels.edge = cEdgeData;
  CONFIG.Item.dataModels.hindrance = cHindranceData;
  CONFIG.Item.dataModels.weapon = cItemData;
  Actors.registerSheet('deadlands', cCharacterSheet, {
    types: ['character'],
    makeDefault: true,
    label: game.i18n.localize('deadlands.sheets.types.character'),
  });
}
