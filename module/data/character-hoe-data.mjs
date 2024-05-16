import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class CharacterHoeDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeAptitudes('HE'),
      ...this.makeChipData(true),
      ...this.makeTraits(),
      ...this.makeWoundLocations(),

      biography: new fields.HTMLField(),
      notes: new fields.HTMLField(),
    };
  }
}
