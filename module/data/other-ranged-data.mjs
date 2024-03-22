import * as dlcFields from './dlc-fields.mjs';

export class OtherRangedDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.setting(),
      name: new fields.StringField({ required: true, blank: false }),
      description: new fields.HTMLField({ required: false }),
      notes: new fields.HTMLField({ required: false }),

      ...dlcFields.integerNoMax('price', 0), // in cents
      ...dlcFields.integer('rof', 1, 1, 3),
      ...dlcFields.integer('rangeIncrement', 10, 5, 20),

      ammo: new fields.StringField({
        required: true,
        blank: false,
        initial: '.44',
      }),
      damage: new fields.StringField({
        required: true,
        blank: false,
        initial: '3d6',
      }),
    };
  }
}
