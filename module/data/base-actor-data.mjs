import { dlcConfig } from '../config.mjs';
import * as dlcFields from './dlc-fields.mjs';

export class BaseActorDataModel extends foundry.abstract.TypeDataModel {
  static makeAptitudes() {
    let aptitudes = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(dlcConfig.aptitudes)) {
      const ranks = Number.isInteger(value.default) > 0 ? value.default : 0;
      if (value.concentrations.length > 0) {
        aptitudes = {
          ...aptitudes,
          ...dlcFields.concentrationAptitude(
            key,
            value.trait,
            ranks,
            ...value.concentrations
          ),
        };
      } else if (value.trait === 'Special') {
        aptitudes = {
          ...aptitudes,
          ...dlcFields.variableAptitude(key, ranks),
        };
      } else {
        aptitudes = {
          ...aptitudes,
          ...dlcFields.aptitude(key, value.trait, ranks),
        };
      }
    }
    return aptitudes;
  }

  static makeChipData(hasChips) {
    return {
      ...dlcFields.boolean('hasChips', hasChips),

      ...dlcFields.integerNoMax('careerBounty', 0, 0),

      ...dlcFields.chip('white'),
      ...dlcFields.chip('red'),
      ...dlcFields.chip('blue'),
      ...dlcFields.chip('green'),
      ...dlcFields.chip('temporaryGreen'),
    };
  }

  static makeTraits() {
    return {
      ...dlcFields.trait(dlcConfig.traits[0]),
      ...dlcFields.trait(dlcConfig.traits[1]),
      ...dlcFields.trait(dlcConfig.traits[2]),
      ...dlcFields.trait(dlcConfig.traits[3]),
      ...dlcFields.trait(dlcConfig.traits[4]),

      ...dlcFields.trait(dlcConfig.traits[5]),
      ...dlcFields.trait(dlcConfig.traits[6]),
      ...dlcFields.trait(dlcConfig.traits[7]),
      ...dlcFields.trait(dlcConfig.traits[8]),
      ...dlcFields.trait(dlcConfig.traits[9]),
    };
  }

  static makeWoundLocations() {
    return {
      ...dlcFields.integer('head', 0, 0, 5),
      ...dlcFields.integer('guts', 0, 0, 5),
      ...dlcFields.integer('left arm', 0, 0, 5),
      ...dlcFields.integer('right arm', 0, 0, 5),
      ...dlcFields.integer('left leg', 0, 0, 5),
      ...dlcFields.integer('right leg', 0, 0, 5),

      // max Wind and max strain are derived attributes
      ...dlcFields.integerNoLimit('currentWind', 0),
      ...dlcFields.integerNoLimit('currentStrain', 0),
    };
  }
}
