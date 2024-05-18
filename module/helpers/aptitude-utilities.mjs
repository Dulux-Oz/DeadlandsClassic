import { dlcConfig } from '../config.mjs';

/*---------------------------------------------------------------------------
 | Takes an aptitude key (e.g. "shootin'") and a worldKey (e.g. 'WW). Returns
 | true if this aptitude is active in the world
 +------------------------------------------------------------------------ */

// eslint-disable-next-line no-underscore-dangle
function _isAptitude(aptitudeKey) {
  const { aptitudes } = dlcConfig;

  return Object.hasOwn(aptitudes, aptitudeKey);
}

// eslint-disable-next-line no-underscore-dangle
function _isworld(worldKey) {
  return ['WW', 'HE', 'LC'].includes(worldKey);
}

export function isActive(aptitudeKey, worldKey) {
  if (!(_isAptitude(aptitudeKey) && _isworld(worldKey))) return false;

  switch (worldKey) {
    case 'WW': {
      return dlcConfig.aptitudes[[aptitudeKey]].isWW;
    }
    case 'HE': {
      return dlcConfig.aptitudes[[aptitudeKey]].isHoe;
    }
    case 'LC': {
      return dlcConfig.aptitudes[[aptitudeKey]].isLC;
    }
    default:
      return false;
  }
}

export function hasConcentrations(aptitudeKey, worldKey) {
  if (!(_isAptitude(aptitudeKey) && _isworld(worldKey))) return false;

  const confRec = dlcConfig.aptitudes[[aptitudeKey]];

  switch (worldKey) {
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

export function getConcentrations(aptitudeKey, worldKey) {
  if (!(_isAptitude(aptitudeKey) && _isworld(worldKey))) return null;

  const confRec = dlcConfig.aptitudes[[aptitudeKey]];

  let configConcentrations = null;

  switch (worldKey) {
    case 'WW': {
      if (confRec.hasUniversalConcentrations) {
        configConcentrations = confRec.concentrations;
      }
      if (confRec.hasConcWW) {
        configConcentrations = confRec.concentrationsWW;
      }
      break;
    }
    case 'HE': {
      if (confRec.hasUniversalConcentrations) {
        configConcentrations = confRec.concentrations;
      }
      if (confRec.hasConcHoe) {
        configConcentrations = confRec.concentrationsHoE;
      }
      break;
    }
    case 'LC': {
      if (confRec.hasUniversalConcentrations) {
        configConcentrations = confRec.concentrations;
      }
      if (confRec.commonHoeAndLC && confRec.hasConcHoe) {
        configConcentrations = confRec.concentrationsHoE;
      }
      if (confRec.hasConcLC) {
        configConcentrations = confRec.concentrationsLC;
      }
      break;
    }
    default:
  }

  return configConcentrations;
}

export function getWorldConcentrationAptitudes() {
  const conc = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(dlcConfig.aptitudes)) {
    const WW = value.hasUniversalConcentrations || value.hasConcWW;
    const HE = value.hasUniversalConcentrations || value.hasConcHoe;
    const LC =
      value.hasUniversalConcentrations ||
      (value.commonHoeAndLC && value.hasConcHoe) ||
      value.hasConcHoe;

    const noConcentrations = !(WW || HE || LC);

    // eslint-disable-next-line no-continue
    if (noConcentrations) continue;

    conc[[key]] = { WW, HE, LC };
  }

  return conc;
}
