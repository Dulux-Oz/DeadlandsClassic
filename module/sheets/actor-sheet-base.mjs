import { dlcConfig } from '../config.mjs';

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

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];
      const trait = actorSystem[value.trait];
      value.die = trait?.dieSize ?? 4;
      value.totalRanks = value.defaultRanks + value.ranks + value.startRanks;
      value.show = value.totalRanks !== 0;

      const confEntry = dlcConfig.aptitudes[key];

      if (confEntry.concentrations?.length > 0) {
        if (!value.concentrations?.length > 0) {
          value.label = `${key} (${value.concentrations.join(', ')})`;
        } else {
          value.label = key;
        }

        value.available = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const cValue of confEntry.concentrations) {
          if (!value.concentrations.includes(cValue)) {
            value.available.push(cValue);
          }
        }
      } else {
        value.label = key;
      }
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
    });

    return context;
  }
}
