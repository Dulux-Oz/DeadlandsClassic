/* eslint-disable no-restricted-syntax */
import * as aptitudeUtils from '../helpers/aptitude-utilities.mjs';

export class DLCActorSheetBase extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template:
        'systems/deadlands-classic/templates/v1apps/char-show/character.html',
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

    const actor = this.object.toObject(false);
    const actorSystem = actor.system;

    for (const key of Object.keys(this.object.aptitudeKeys)) {
      aptitudes[key] = { ...actorSystem[key] };
    }

    for (const key of Object.keys(this.object.traitKeys)) {
      traits[key] = { ...actorSystem[key] };
    }

    for (const key of Object.keys(this.object.chipKeys)) {
      chips[key] = actorSystem[key];
      chips[`has${key}`] = chips[key] > 0;
    }

    for (const key of Object.keys(this.object.locationKeys)) {
      woundLocations[key] = actorSystem[key];
    }

    for (const key of Object.keys(this.object.unclassifiedKeys)) {
      unclassified[key] = actorSystem[key];
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(traits)) {
      traits[key].label = key;

      traits[key].totalRanks =
        traits[key].cardRanks +
        traits[key].startRanks +
        traits[key].bountyRanks;

      traits[key].totalDieSize = this.object.dieSize(key);

      traits[key].traitID = key;
    }

    const { careerBounty } = actorSystem;

    const world =
      // prettier-ignore
      // eslint-disable-next-line no-nested-ternary
      actor.type === 'characterww'  ? 'WW' : 
      actor.type === 'characterhoe' ? 'HE' : 'LC';

    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];
      const trait = traits[value.trait];
      aptitudes[key].die = trait?.totalDieSize;
      aptitudes[key].totalRanks =
        value.defaultRanks + value.startRanks + value.bountyRanks;
      aptitudes[key].show = aptitudes[key].totalRanks !== 0;

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

      // prettier-ignore
      if (aptitudes[key].hasConfigConcentrations) {

        // Don't need to construct concentrations taken, it's concentrations :-)
        if (aptitudes[key].hasConcentrations) {
          aptitudes[key].label = `${key} (${value.concentrations.join(', ')})`;
        } else {
          aptitudes[key].label = key;
        }

        aptitudes[key].available = {};
        // prettier-ignore
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
    const owner = this.object.isOwner;

    context = foundry.utils.mergeObject(context, {
      actorId: this.object.id,
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
