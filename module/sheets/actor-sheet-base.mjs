/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import * as aptitudeUtils from '../helpers/aptitude-utilities.mjs';

const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class DLCActorSheetBase extends sheets.ActorSheetV2 {
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

    const items = this._prepareItemsContext();

    context = foundry.utils.mergeObject(context, {
      actorId: this.actor.id,
      aptitudes,
      chips,
      cssClass: isEditable ? 'editable' : 'locked',
      isEditable,
      ...items,
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

  _prepareItemsContext() {
    const edges = [];
    const hindrances = [];
    const spellLikes = [];
    const guns = [];
    const otherRangedItems = [];
    const meleeItems = [];
    const miscItems = [];

    for (const i of this.document.items) {
      if (i.system.price) {
        i.system.displayprice = Math.floor(i.system.price / 100);
      }

      if (i.type === 'edge') {
        edges.push(i);
      } else if (i.type === 'hindrance') {
        hindrances.push(i);
      } else if (i.type === 'spellLike') {
        spellLikes.push(i);
      } else if (i.type === 'gun') {
        guns.push(i);
      } else if (i.type === 'otherRanged') {
        otherRangedItems.push(i);
      } else if (i.type === 'melee') {
        meleeItems.push(i);
      } else if (i.type === 'miscItem') {
        miscItems.push(i);
      }
    }

    edges.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    hindrances.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    spellLikes.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    guns.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    otherRangedItems.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    meleeItems.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    miscItems.sort((a, b) => (a.sort || 0) - (b.sort || 0));

    return {
      edges,
      hindrances,
      spellLikes,
      guns,
      otherRangedItems,
      meleeItems,
      miscItems,
    };
  }
}

// Might add active effect and dropping folders of items later

// /* -------------------------------------------- */

// /**
//  * Handle the dropping of ActiveEffect data onto an Actor Sheet
//  * @param {DragEvent} event                  The concluding DragEvent which contains drop data
//  * @param {object} data                      The data transfer extracted from the event
//  * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
//  * @protected
//  */
// async _onDropActiveEffect(event, data) {
//   const effect = await ActiveEffect.implementation.fromDropData(data);
//   if (!this.actor.isOwner || !effect) return false;
//   if (effect.target === this.actor) return false;
//   return ActiveEffect.create(effect.toObject(), { parent: this.actor });
// }

//   /* -------------------------------------------- */

// /**
//  * Handle dropping of a Folder on an Actor Sheet.
//  * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
//  * @param {DragEvent} event     The concluding DragEvent which contains drop data
//  * @param {object} data         The data transfer extracted from the event
//  * @returns {Promise<Item[]>}
//  * @protected
//  */
// async _onDropFolder(event, data) {
//   if (!this.actor.isOwner) return [];
//   const folder = await Folder.implementation.fromDropData(data);
//   if (folder.type !== 'Item') return [];
//   const droppedItemData = await Promise.all(
//     folder.contents.map(async (item) => {
//       if (!(document instanceof Item)) {
//         item = await fromUuid(item.uuid);
//       }
//       return item.toObject();
//     })
//   );
//   return this._onDropItemCreate(droppedItemData, event);
// }
