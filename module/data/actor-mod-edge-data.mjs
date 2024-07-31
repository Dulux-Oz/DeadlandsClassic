import { ActorModBaseDataModel } from './actor-mod-base-data.mjs';

export class ActorModEdgeModel extends ActorModBaseDataModel {
  static defineSchema() {
    const { fields } = foundry.data;

    return {
      ...this.makeActorModBaseData(),

      // Posessing this edge gives the character an arcane flavour.
      ...this.makeArcaneFlavourData(),

      grantsArcane: new fields.BooleanField({ initial: false }),
    };
  }
}
