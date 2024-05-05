/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/**
 * The sidebar directory which organizes and displays world-level Combat documents.
 */
export class ChipAllocator extends FormApplication {
  /** @inheritdoc */

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: 'systems/deadlands-classic/templates/chip/allocator.html',
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
   * Handle standard form submission steps
   * @param {Event} event               The submit event which triggered this handler
   * @param {object | null} [updateData]  Additional specific data keys/values which override or extend the contents of
   *                                    the parsed form. This can be used to update other flags or data fields at the
   *                                    same time as processing a form submission to avoid multiple database operations.
   * @param {boolean} [preventClose]    Override the standard behavior of whether to close the form on submit
   * @param {boolean} [preventRender]   Prevent the application from re-rendering as a result of form submission
   * @returns {Promise}                 A promise which resolves to the validated update data
   * @protected
   */
  async _onSubmit(
    event,
    { updateData = null, preventClose = false, preventRender = false } = {}
  ) {
    event.preventDefault();

    // Prevent double submission
    const states = this.constructor.RENDER_STATES;
    if (this._state === states.NONE || !this.isEditable || this._submitting)
      return false;
    this._submitting = true;

    // Handle the form state prior to submission
    let closeForm = this.options.closeOnSubmit && !preventClose;
    const priorState = this._state;
    if (preventRender) this._state = states.RENDERING;
    if (closeForm) this._state = states.CLOSING;

    // Process the form data
    const formData = this._getSubmitData(updateData);

    // extract the form data
    const { white, red, blue, green, temporaryGreen, ...actors } = formData;
    const allocate = { white, red, blue, green, temporaryGreen };

    const receiverIds = Object.keys(actors).filter(
      (k) => actors[k] === 'checked'
    );

    // Trigger the object update
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const actorId of receiverIds) {
        game['deadlands-classic'].socket.executeAsGM(
          'socketAddChipsActor',
          actorId,
          allocate
        );
      }
    } catch (err) {
      console.error(err);
      closeForm = false;
      this._state = priorState;
    }

    // Restore flags and optionally close the form
    this._submitting = false;
    if (preventRender) this._state = priorState;
    if (closeForm) await this.close({ submit: false, force: true });
    return formData;
  }
}
