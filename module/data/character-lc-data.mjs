import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class CharacterLcDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeAptitudes('LC'),
      ...this.makeChipData(true),
      ...this.makeTraits(),
      ...this.makeWoundLocations(),

      biography: new fields.HTMLField(),
      notes: new fields.HTMLField(),
    };
  }
}
