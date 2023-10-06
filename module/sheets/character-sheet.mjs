import { dlcConfig } from '../config.mjs';

export class BaseActorSheetDlc extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template: 'systems/deadlands-classic/templates/dlc-character-sheet.html',
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
    const concentrations = {};
    const traits = {};
    const unclassified = {};

    const actor = this.document.toObject(false);
    const actorSystem = actor.system;
    const keys = Object.keys(actorSystem);

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
            case 'chip':
              chips[key] = slot;
              break;
            default:
            // There is no default case, the document validation has restriced
            // this value.
          }
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
      value.totalRanks =
        value.defaultRanks.value + value.ranks.value + value.startRanks.value;
      value.show = value.totalRanks !== 0;

      const confEntry = dlcConfig.aptitudes[key];

      if (confEntry.concentrations?.length > 0) {
        value.available = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const cValue of confEntry.concentrations) {
          if (!value.concentrations.includes(cValue)) {
            value.available.push(cValue);
          }
        }
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
