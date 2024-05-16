import { dlcConfig } from '../config.mjs';
import { BaseActorDataModel } from '../data/base-actor-data.mjs';

export class DLCActorSheetBase extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template: 'systems/deadlands-classic/templates/actor-sheet/pc-sheet.html',
      width: 660,
      height: 800,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'main',
        },
      ],
    });
  }

  static getConcentrations() {
    const concentrations = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(dlcConfig.aptitudes)) {
      if (value.concentrations.length > 0) {
        concentrations[key] = foundry.utils.deepClone(value.concentrations);
      }
    }
    return concentrations;
  }

  /** @override */
  async getData(options) {
    let context = super.getData(options);

    const aptitudes = {};
    const chips = {};
    const traits = {};
    const unclassified = {};

    const actor = this.document.toObject(false);
    const actorSystem = actor.system;
    const keys = Object.keys(actorSystem);

    const validChips = {
      white: 0,
      red: 0,
      blue: 0,
      green: 0,
      temporaryGreen: 0,
    };

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key of keys.values()) {
      if (Object.prototype.hasOwnProperty.call(actorSystem, key)) {
        const slot = actorSystem[key];
        if (Object.prototype.hasOwnProperty.call(slot, 'valueType')) {
          switch (slot.valueType) {
            case 'trait':
              traits[key] = slot;
              break;
            case 'aptitude':
              aptitudes[key] = slot;
              break;
            default:
            // There is no default case, the document validation has restriced
            // this value.
          }
        } else if (key in validChips) {
          chips[key] = slot;
          chips[`has${key}`] = slot > 0;
        } else {
          unclassified[key] = slot;
        }
      }
    }

    const { Cognition } = traits;
    const { Knowledge } = traits;
    const { Smarts } = traits;

    const aptitudePoints =
      (Cognition?.dieSize ?? 4) +
      (Knowledge?.dieSize ?? 4) +
      (Smarts?.dieSize ?? 4);

    const { careerBounty } = actorSystem;

    const world =
      // prettier-ignore
      // eslint-disable-next-line no-nested-ternary
      actor.type === 'characterww'  ? 'WW' : 
      actor.type === 'characterhoe' ? 'HE' : 'LC';

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];
      const trait = actorSystem[value.trait];
      aptitudes[key].die = trait?.dieSize ?? 4;
      aptitudes[key].totalRanks =
        value.defaultRanks + value.ranks + value.startRanks;
      aptitudes[key].show = aptitudes[key].totalRanks !== 0;

      const confEntry = dlcConfig.aptitudes[key];

      if (BaseActorDataModel.hasConcentrations(confEntry, world)) {
        if (!value.concentrations?.length > 0) {
          aptitudes[key].label = `${key} (${value.concentrations.join(', ')})`;
        } else {
          aptitudes[key].label = key;
        }

        aptitudes[key].available = [];
        // prettier-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const cValue of BaseActorDataModel.getConcentrations(confEntry, world)) {
          if (!value.concentrations.includes(cValue)) {
            aptitudes[key].available.push(cValue);
          }
        }
      } else {
        aptitudes[key].label = key;
      }

      aptitudes[key].aptitudeID = key;
    }

    const { isEditable } = this;
    const { title } = this;
    const owner = this.document.isOwner;

    context = foundry.utils.mergeObject(context, {
      actorId: this.document.id,
      aptitudes,
      chips,
      cssClass: isEditable ? 'editable' : 'locked',
      isEditable,
      owner,
      title,
      traits,
      unclassified,

      aptitudePoints,
      careerBounty,
    });

    return context;
  }
}
