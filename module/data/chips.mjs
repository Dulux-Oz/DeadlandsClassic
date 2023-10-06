import * as dlcFields from '../dlc-fields.mjs';

export class dlcChips extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;

    return {
      chips: new fields.SchemaField({
        ...dlcFields.dlcNumberNoMax('white', 0, 0),
        ...dlcFields.dlcNumberNoMax('red', 0, 0),
        ...dlcFields.dlcNumberNoMax('blue', 0, 0),
      }),
    };
  }
}
