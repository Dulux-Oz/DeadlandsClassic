import * as dlcFields from './dlc-fields.mjs';

export class MiscItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.setting(),
      notes: new fields.HTMLField({ required: false }),
      ...dlcFields.integerNoMax('price', 0), // in cents
    };
  }
}
