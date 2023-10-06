import * as dlcFields from '../dlc-fields.mjs';

export class TweakData extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.dlcSetting(),
      Description: new fields.HTMLField(),
    };
  }
}
