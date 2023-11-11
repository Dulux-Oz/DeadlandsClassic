import * as dlcFields from '../dlc-fields.mjs';

/* This class is intended for the Marshall's chips, which are in a world level setting.
 * The players' chip records are in their character data.
 */

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
