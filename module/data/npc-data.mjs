import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class NPCDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeTraits(),
      ...this.makeAptitudes(),
      ...this.makeWoundLocations(),

      biography: new fields.HTMLField(),
      notes: new fields.HTMLField(),

      ...this.makeChipData(false),
    };
  }
}
