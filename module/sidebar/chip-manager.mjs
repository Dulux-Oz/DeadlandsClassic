/**
 * The sidebar directory which organizes and displays world-level Combat documents.
 */
export class ChipManager extends SidebarTab {
  constructor(options) {
    super(options);
    /* global ui */
    if (ui.sidebar) ui.sidebar.tabs.chips = this;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'chips',
      template: 'systems/deadlands-classic/templates/sidebar/chip-manager.html',
      title: game.i18n.localize('DLC.sheet.chip'),
      scrollY: ['.directory-list'],
    });
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options = {}) {
    let context = await super.getData(options);

    // Get the actors who can hold chips
    const chipBearers = game.actors.filter(
      (a) => a.system.ActiveForChips === true
    );

    const posse = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const actor of chipBearers) {
      const { name } = actor;
      const { id } = actor;
      const { img } = actor;
      posse.push({ name, id, img });
    }

    context = foundry.utils.mergeObject(context, {
      posse,
    });
    return context;
  }
}
