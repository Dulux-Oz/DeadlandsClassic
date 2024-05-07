import { Chips } from '../helpers/chips.mjs';
import { DLCBaseActorSheet } from './base-actor-sheet.mjs';

export class CreateActorSheet extends DLCBaseActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template:
        'systems/deadlands-classic/templates/char-create/create-character.html',
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
    const context = super.getData(options);

    return context;
  }
}
