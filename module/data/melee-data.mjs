import * as dlcFields from './dlc-fields.mjs';

export class MeleeDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.setting(),
      ...dlcFields.integerNoMax('db', 0), // Defence bonus
      notes: new fields.HTMLField({ required: false }),
      ...dlcFields.integerNoMax('price', 0), // in cents
      damage: new fields.StringField({
        required: true,
        blank: false,
        initial: '3d6',
      }),
    };
  }
}
