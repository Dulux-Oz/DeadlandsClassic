import * as dlcFields from './dlc-fields.mjs';

export class GunDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.setting(),
      description: new fields.HTMLField({ required: false }),
      notes: new fields.HTMLField({ required: false }),
      calibre: new fields.StringField({
        required: true,
        blank: false,
        initial: '.44',
      }),
      ...dlcFields.integerNoMax('price', 0), // in cents
      ...dlcFields.integerNoMax('shots', 0),
      ...dlcFields.integer('rof', 1, 1, 3),
      damage: new fields.StringField({
        required: true,
        blank: false,
        initial: '3d6',
      }),
      ...dlcFields.integer('rangeIncrement', 10, 5, 20),
    };
  }
}
