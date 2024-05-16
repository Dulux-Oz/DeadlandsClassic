import { dlcConfig } from '../config.mjs';
import * as dlcFields from './dlc-fields.mjs';

export class BaseActorDataModel extends foundry.abstract.TypeDataModel {
  static isActive(confRec, world) {
    switch (world) {
      case 'WW': {
        return confRec.isWW;
      }
      case 'HE': {
        return confRec.isHoe;
      }
      case 'LC': {
        return confRec.isLC;
      }
      default:
        return false;
    }
  }

  static hasConcentrations(confRec, world) {
    switch (world) {
      case 'WW': {
        return confRec.hasUniversalConcentrations || confRec.hasConcWW;
      }
      case 'HE': {
        return confRec.hasUniversalConcentrations || confRec.hasConcHoe;
      }
      case 'LC': {
        return (
          confRec.hasUniversalConcentrations ||
          (confRec.commonHoeAndLC && confRec.hasConcHoe) ||
          confRec.hasConcLC
        );
      }
      default:
        return false;
    }
  }

  static getConcentrations(confRec, world) {
    switch (world) {
      case 'WW': {
        if (confRec.hasUniversalConcentrations) return confRec.concentrations;
        if (confRec.hasConcWW) return confRec.concentrationsWW;
        return null;
      }
      case 'HE': {
        if (confRec.hasUniversalConcentrations) return confRec.concentrations;
        if (confRec.hasConcHoe) return confRec.concentrationsHoE;
        return null;
      }
      // prettier-ignore
      case 'LC': {
        if (confRec.hasUniversalConcentrations) return confRec.concentrations;
        if (confRec.commonHoeAndLC && confRec.hasConcHoe) return confRec.concentrationsHoE;
        if (confRec.hasConcLC) return confRec.concentrationsLC;
        return null;
      }
      default:
        return null;
    }
  }

  static makeAptitudes(world) {
    let aptitudes = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(dlcConfig.aptitudes)) {
      // eslint-disable-next-line no-continue
      if (!this.isActive(value, world)) continue;

      const defaultRanks =
        Number.isInteger(value.default) > 0 ? value.default : 0;
      if (this.hasConcentrations(value, world)) {
        const conc = this.getConcentrations(value, world) ?? [];
        aptitudes = {
          ...aptitudes,
          ...dlcFields.concentrationAptitude(
            key,
            value.trait,
            defaultRanks,
            ...conc
          ),
        };
      } else if (value.trait === 'Special') {
        aptitudes = {
          ...aptitudes,
          ...dlcFields.variableAptitude(key, defaultRanks),
        };
      } else {
        aptitudes = {
          ...aptitudes,
          ...dlcFields.aptitude(key, value.trait, defaultRanks),
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
