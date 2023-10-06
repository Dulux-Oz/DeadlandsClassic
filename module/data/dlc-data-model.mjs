import { CharacterDataModel } from './character-data.mjs';
import { ItemData } from './item.mjs';
import { NPCDataModel } from './npc-data.mjs';
import { TweakData } from './tweak.mjs';

export function registerDataModel() {
  CONFIG.Actor.dataModels.character = CharacterDataModel;
  CONFIG.Actor.dataModels.npc = NPCDataModel;
  CONFIG.Item.dataModels.edge = TweakData;
  CONFIG.Item.dataModels.hindrance = TweakData;
  CONFIG.Item.dataModels.weapon = ItemData;
}
