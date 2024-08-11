import { ActorModBaseDataModel } from './actor-mod-base-data.mjs';

export class ActorModSpellLikeModel extends ActorModBaseDataModel {
  static defineSchema() {
    const { fields } = foundry.data;

    return {
      ...this.makeActorModBaseData(),

      // This ability is only available to characters with a particular arcane flavour.
      ...this.makeArcaneFlavourData(),

      isArcane: new fields.BooleanField({ initial: true }),
    };
  }
}
