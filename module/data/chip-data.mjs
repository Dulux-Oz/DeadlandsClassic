import * as dlcFields from './dlc-fields.mjs';

/* This class is intended for the Marshall's chips, which are in a world level setting.
 * The players' chip records are in their character data.
 */

export class ChipDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;

    return {
      chips: new fields.SchemaField({
        ...dlcFields.integerNoMax('white', 0, 0),
        ...dlcFields.integerNoMax('red', 0, 0),
        ...dlcFields.integerNoMax('blue', 0, 0),
      }),
    };
  }
}
