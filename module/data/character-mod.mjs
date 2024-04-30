import { dlcConfig } from '../config.mjs';
import * as dlcFields from './dlc-fields.mjs';

export class CharacterModModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      ...dlcFields.setting(),

      blurb: new fields.HTMLField({ required: true }),

      ...dlcFields.modLevel('one'),
      ...dlcFields.modLevel('two'),
      ...dlcFields.modLevel('three'),
      ...dlcFields.modLevel('four'),
      ...dlcFields.modLevel('five'),
      ...dlcFields.modLevel('capstone'),

      ...dlcFields.integer('startLevel', 0, 0, 5), // start level
      ...dlcFields.integer('level', 0, 0, 5), // Current level
      ...dlcFields.boolean('hasCapstone', false), // is the capstone active

      arcaneFlavour: new fields.StringField({
        required: true,
        initial: 'none',
        choices: dlcConfig.arcaneFlavour,
      }),
      grantsArcane: new fields.BooleanField({ initial: false }),
      isArcane: new fields.BooleanField({ initial: false }),
    };
  }
}
