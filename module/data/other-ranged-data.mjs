import * as dlcFields from './dlc-fields.mjs';

export class OtherRangedDataModel extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ['DLC.item'];

  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.itemCommonFields(),

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
