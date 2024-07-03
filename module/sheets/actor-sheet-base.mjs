/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import * as aptitudeUtils from '../helpers/aptitude-utilities.mjs';

const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class DLCActorSheetBase extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  /** @override */
  async _prepareContext(options) {
    let context = await super._prepareContext(options);

    const aptitudes = {};
    const chips = {};
    const traits = {};
    const unclassified = {};
    const woundLocations = {};

    const actor = this.actor.toObject(false);
    const actorSystem = actor.system;

    for (const key of Object.keys(this.actor.aptitudeKeys)) {
      aptitudes[key] = { ...actorSystem[key] };
    }

    for (const key of Object.keys(this.actor.traitKeys)) {
      traits[key] = { ...actorSystem[key] };
    }

    for (const key of Object.keys(this.actor.chipKeys)) {
      chips[key] = actorSystem[key];
      chips[`has${key}`] = chips[key] > 0;
    }

    for (const key of Object.keys(this.actor.locationKeys)) {
      woundLocations[key] = actorSystem[key];
    }

    for (const key of Object.keys(this.actor.unclassifiedKeys)) {
      unclassified[key] = actorSystem[key];
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(traits)) {
      traits[key].label = key;

      traits[key].totalRanks =
        traits[key].cardRanks +
        traits[key].startRanks +
        traits[key].bountyRanks;

      traits[key].totalDieSize = this.actor.dieSize(key);

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
    const { name, img } = this.actor;
    const owner = this.actor.isOwner;

    context = foundry.utils.mergeObject(context, {
      actorId: this.actor.id,
      aptitudes,
      chips,
      cssClass: isEditable ? 'editable' : 'locked',
      isEditable,
      img,
      name,
      owner,
      title,
      traits,
      unclassified,
      woundLocations,
      careerBounty,

      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
    });

    return context;
  }
}
