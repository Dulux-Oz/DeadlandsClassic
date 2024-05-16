import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class CharacterWwDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeAptitudes('WW'),
      ...this.makeChipData(true),
      ...this.makeTraits(),
      ...this.makeWoundLocations(),

      biography: new fields.HTMLField(),
      cards: new fields.StringField({ required: false }),
      notes: new fields.HTMLField(),
    };
  }
}
