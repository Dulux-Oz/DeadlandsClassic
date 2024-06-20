/* eslint-disable no-underscore-dangle */

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class AllocateChipsMarshal extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  /** @inheritdoc */

  static DEFAULT_OPTIONS = {
    form: {
      handler: AllocateChipsMarshal.formHandler,
      submitOnChange: false,
      closeOnSubmit: true,
    },
    tag: 'form',
    scrollY: ['.directory-list'],
    window: {
      icon: '',
      title: '',
    },
  };

  static PARTS = {
    form: {
      template:
        'systems/deadlands-classic/templates/chip/allocator-marshal.html',
    },
  };

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options = {}) {
    let context = await super._prepareContext(options);

    // Get the actors who can hold chips
    const chipBearers = game.actors.filter((a) => a.system.hasChips === true);

    const posse = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const actor of chipBearers) {
      const { name, id, img } = actor;
      posse.push({ name, id, img });
    }

    context = foundry.utils.mergeObject(context, {
      posse,
    });
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Process form submission for the sheet
   * @this  {MyApplication}              The handler is called with the application as its bound scope
   * @param {SubmitEvent} event          The originating form submission event
   * @param {HTMLFormElement} form       The form element that was submitted
   * @param {FormDataExtended} formData  Processed data for the submitted form
   * @returns {Promise<void>}
   */

  static async formHandler(event, form, formData) {
    event.preventDefault();

    // Prevent double submission
    const states = this.constructor.RENDER_STATES;

    if (this.state === states.NONE || this._submitting) {
      return false;
    }

    this._submitting = true;

    // Process the form data
    const settings = foundry.utils.expandObject(formData.object);

    // extract the form data
    const { white, red, blue } = settings;
    const allocate = { white, red, blue };

    // Trigger the object update
    try {
      // eslint-disable-next-line no-restricted-syntax
      await game['deadlands-classic'].socket.executeAsGM(
        'socketAddChipsMarshal',
        allocate
      );
      globalThis.ui.chips.render();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    // Restore flags and optionally close the form
    this._submitting = false;
    return formData;
  }
}
