import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class CharacterDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeAptitudes(),
      ...this.makeChipData(true),
      ...this.makeTraits(),
      ...this.makeWoundLocations(),

      biography: new fields.HTMLField(),
      notes: new fields.HTMLField(),
    };
  }
}
