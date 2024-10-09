import * as dlcFields from './dlc-fields.mjs';

export class MiscItemDataModel extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ['DLC.item'];

  static defineSchema() {
    return {
      ...dlcFields.itemCommonFields(),
      ...dlcFields.integerNoMax('quantity', 1),
    };
  }
}
