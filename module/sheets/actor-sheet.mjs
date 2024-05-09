import { Chips } from '../helpers/chips.mjs';
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

export class DLCActorSheet extends DLCActorSheetBase {
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
    const context = super.getData(options);

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // chip control
    html.find('.chip-control').click((ev) => this.#onChipControl(ev));
  }

  /**
   * Handle a chip allocation event
   * @private
   * @param {Event} event The originating mousedown event
   */
  async #onChipControl(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;

    // eslint-disable-next-line default-case
    switch (btn.dataset.control) {
      case 'useWhite':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUseChipActor',
          this.document.id,
          Chips.type.White
        );
        break;

      case 'useRed':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUseChipActor',
          this.document.id,
          Chips.type.Red
        );
        break;

      case 'useBlue':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUseChipActor',
          this.document.id,
          Chips.type.Blue
        );
        break;

      case 'useGreen':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUseChipActor',
          this.document.id,
          Chips.type.Green
        );
        break;

      case 'useTemporaryGreen':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUseChipActor',
          this.document.id,
          Chips.type.TemporaryGreen
        );
        break;

      case 'convertWhite':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketConvertChipActor',
          this.document.id,
          Chips.type.White
        );
        break;

      case 'convertRed':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketConvertChipActor',
          this.document.id,
          Chips.type.Red
        );
        break;

      case 'convertBlue':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketConvertChipActor',
          this.document.id,
          Chips.type.Blue
        );
        break;

      case 'convertGreen':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketConvertChipActor',
          this.document.id,
          Chips.type.Green
        );
        break;

      case 'convertTemporaryGreen':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketConvertChipActor',
          this.document.id,
          Chips.type.TemporaryGreen
        );
        break;

      case 'consumeGreen':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketConsumeGreenChipActor',
          this.document.id
        );
        break;

      case 'drawOne':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketDrawChipActor',
          this.document.id,
          1
        );
        break;

      case 'drawThree':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketDrawChipActor',
          this.document.id,
          3
        );
        break;
    }
    this.render();
  }
}
