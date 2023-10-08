import * as DLCFields from '../dlc-fields.mjs';
import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class NPCDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeTraits(),
      ...this.makeAptitudes(),
      ...this.makeWoundLocations(),

      Biography: new fields.HTMLField(),
      Notes: new fields.HTMLField(),

      ...this.makeChips(false),
    };
  }
}
