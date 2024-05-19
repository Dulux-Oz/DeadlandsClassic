import { dlcConfig } from '../config.mjs';
import * as aptitudeUtils from '../helpers/aptitude-utilities.mjs';

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

  /** @override */
  async getData(options) {
    let context = super.getData(options);

    const aptitudes = {};
    const chips = {};
    const traits = {};
    const unclassified = {};
    const woundLocations = {};

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

    const validWoundLocations = {
      head: true,
      guts: true,
      'left arm': true,
      'right arm': true,
      'left leg': true,
      'right leg': true,
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
        } else if (key in validWoundLocations) {
          woundLocations[key] = slot;
        } else {
          unclassified[key] = slot;
        }
      }
    }

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
        value.defaultRanks + value.startRanks + value.ranks;
      aptitudes[key].show = aptitudes[key].totalRanks !== 0;

      const confEntry = dlcConfig.aptitudes[key];

      /* --------------------------------------------------------------------
       | Calculate useful flags for The presence of concentrations in this 
       | attribute and whether there are any available to add */

      aptitudes[key].hasConfigConcentrations = aptitudeUtils.hasConcentrations(
        key,
        world
      );

      aptitudes[key].hasConcentrations =
        aptitudes[key].hasConfigConcentrations &&
        typeof value.concentrations?.length !== 'undefined' &&
        value.concentrations.length > 0;

      aptitudes[key].hasAvailable = false;

      if (aptitudes[key].hasConfigConcentrations) {
        if (aptitudes[key].hasConcentrations) {
          aptitudes[key].label = `${key} (${value.concentrations.join(', ')})`;
        } else {
          aptitudes[key].label = key;
        }

        aptitudes[key].available = {};
        // prettier-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const cValue of aptitudeUtils.getConcentrations(key, world)) {
          if (!value.concentrations.includes(cValue)) {
            aptitudes[key].available[cValue] = cValue;
            aptitudes[key].hasAvailable = true;
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
      woundLocations,

      careerBounty,
    });

    return context;
  }
}
