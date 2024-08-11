import { ActorModBaseDataModel } from './actor-mod-base-data.mjs';
import * as dlcFields from './dlc-fields.mjs';

export class ActorModHindranceModel extends ActorModBaseDataModel {
  static defineSchema() {
    return {
      ...this.makeActorModBaseData(),

      ...dlcFields.boolean('isBoughtOff', false), // Is this hindrance no longer active.
    };
  }
}
