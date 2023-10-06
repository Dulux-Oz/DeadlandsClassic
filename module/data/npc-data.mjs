import * as DLCFields from '../dlc-fields.mjs';
import { BaseActorDataModel } from './base-actor-data.mjs';

const { fields } = foundry.data;

export class NPCDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...this.makeTraits(),
      ...this.makeAptitudes(),

      ...DLCFields.dlcNumber('Wind', 10, 0, 10),
      ...DLCFields.dlcNumber('Strain', 10, 0, 10),

      Biography: new fields.HTMLField(),
      Notes: new fields.HTMLField(),

      ActiveForChips: new fields.BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}
