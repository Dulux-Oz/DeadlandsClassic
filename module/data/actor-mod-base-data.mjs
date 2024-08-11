import { dlcConfig } from '../config.mjs';
import * as dlcFields from './dlc-fields.mjs';

export class ActorModBaseDataModel extends foundry.abstract.TypeDataModel {
  static makeActorModBaseData() {
    const { fields } = foundry.data;

    // prettier-ignore
    return {
      ...dlcFields.setting(),

      blurb: new fields.HTMLField({ required: true }),

      ...dlcFields.modLevel('one'),
      ...dlcFields.modLevel('two'),
      ...dlcFields.modLevel('three'),
      ...dlcFields.modLevel('four'),
      ...dlcFields.modLevel('five'),
      ...dlcFields.modLevel('capstone'),

      // For Mods that need differentiation e.g. "Major Phobia of <characterize>"
      ...dlcFields.boolean('needsCharacterized', false), // Does this need the characterize filed set;.
      characterize: new fields.StringField({ required: false, initial: '' }),
      
      // the data that allows application of this actor mod.

      // Level is the level we have this at. If start level is also set then we got this at
      // character creation, this affects the bounty cost (level - startLevel) * 3
      // If they're equal then we only got it at character creation.

      ...dlcFields.integer('startLevel', 0, 0, 5), // start level
      ...dlcFields.integer('level', 0, 0, 5),      // Current level

      ...dlcFields.boolean('capstoneActive', false), // is the capstone active

      ...dlcFields.integerNoLimit('bountyCost', 0),     // How much bounty had been paid for this. In a hindrance this is the cancellation cost.
      ...dlcFields.integerNoLimit('pointCost', 0),      // How many character creation points this mod cost (only for edges and spellLikes).
      ...dlcFields.integerNoLimit('pointsProvided', 0), // How many character creation points this mod provided (for hinderances and vetran edges).
    };
  }

  static makeArcaneFlavourData() {
    const { fields } = foundry.data;

    return {
      arcaneFlavour: new fields.StringField({
        required: true,
        initial: 'none',
        choices: dlcConfig.arcaneFlavour,
      }),
    };
  }
}
