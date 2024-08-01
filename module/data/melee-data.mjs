import * as dlcFields from './dlc-fields.mjs';

export class MeleeDataModel extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ['DLC.item'];

  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.itemCommonFields(),
      ...dlcFields.integerNoMax('db', 0), // Defence bonus
      damage: new fields.StringField({
        required: true,
        blank: false,
        initial: '3d6',
      }),
    };
  }
}
