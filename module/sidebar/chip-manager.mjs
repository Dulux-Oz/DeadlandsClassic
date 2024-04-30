import { ChipAllocator } from '../apps/chip-allocator.mjs';
import { Chips } from '../helpers/chips.mjs';

/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/**
 * The sidebar directory which organizes and displays world-level Combat documents.
 */
export class ChipManager extends SidebarTab {
  constructor(options) {
    super(options);
    /* global ui */
    if (ui.sidebar) ui.sidebar.tabs.chips = this;

    /* This will hold the application used when allocating chips */
    Object.defineProperty(this, '_chipAllocator', {
      value: null,
      writable: true,
      enumerable: false,
    });

    globalThis.ChipManager = this;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'chips',
      template: 'systems/deadlands-classic/templates/sidebar/chip-manager.html',
      scrollY: ['.directory-list'],
    });
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options = {}) {
    // Update the game's notion of which chips are available
    Chips.buildCurrentChipPool();

    const { white, red, blue, green } = game.chips.available;

    const marshal = game.settings.get('deadlands-classic', 'marshal-chips');

    const chips = {
      white,
      red,
      blue,
      green,

      hasWhite: marshal.chips.white > 0,
      hasRed: marshal.chips.red > 0,
      hasBlue: marshal.chips.blue > 0,

      marshalWhite: marshal.chips.white,
      marshalRed: marshal.chips.red,
      marshalBlue: marshal.chips.blue,
    };

    let context = await super.getData(options);
    context = foundry.utils.mergeObject(context, { chips });

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

    if (btn.dataset.control === 'chipAllocator') {
      if (!this._chipAllocator) {
        this._chipAllocator = new ChipAllocator(this, {});
      }
      this._chipAllocator.render(true);
    } else if (btn.dataset.control === 'drawChip') {
      await game['deadlands-classic'].socket.executeAsGM(
        'socketDrawChipMarshal'
      );
      this.render();
    } else {
      const marshal = game.settings.get('deadlands-classic', 'marshal-chips');
      const newMarshal = marshal.toObject();

      let updated = false;

      if (btn.dataset.control === 'useMarshalBlue') {
        if (newMarshal.chips.blue > 0) {
          newMarshal.chips.blue -= 1;
          updated = true;
        }
      } else if (btn.dataset.control === 'useMarshalRed') {
        if (newMarshal.chips.red > 0) {
          newMarshal.chips.red -= 1;
          updated = true;
        }
      } else if (btn.dataset.control === 'useMarshalWhite') {
        if (newMarshal.chips.white > 0) {
          newMarshal.chips.white -= 1;
          updated = true;
        }
      }

      if (updated) {
        await game.settings.set(
          'deadlands-classic',
          'marshal-chips',
          newMarshal
        );
        this.render();
      }
    }
  }

  /** @override */
  async _render(force = false, options = {}) {
    await super._render(force, options);

    const isPc = game.actors.filter((actor) => actor.system.hasChips);

    // eslint-disable-next-line no-restricted-syntax
    for (const actor of Object.values(isPc)) {
      // Register the active Application with the referenced Documents
      actor.apps[this.appId] = this;
    }
  }
}
