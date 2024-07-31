import * as dlcFields from './dlc-fields.mjs';

export class GunDataModel extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ['DLC.item'];

  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.setting(),
      description: new fields.HTMLField({ required: true, initial: '' }),
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
      ...dlcFields.integerStepped('rangeIncrement', 10, 5, 30, 5),
    };
  }
}
