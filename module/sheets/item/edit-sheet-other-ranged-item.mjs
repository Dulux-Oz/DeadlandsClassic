/* eslint-disable no-underscore-dangle */

const { api, sheets } = foundry.applications;

export class EditOtherRangedItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['dlc', 'sheet', 'item'],
    position: {
      width: 560,
      height: 760,
    },
    window: {
      resizable: true,
    },
    actions: {},
    form: {
      handler: this.#onSubmitOtherRanged,
      submitOnChange: true,
    },
  };

  static PARTS = {
    header: {
      template: 'systems/deadlands-classic/templates/item/header.hbs',
    },
    setting: {
      template: 'systems/deadlands-classic/templates/item/setting.hbs',
    },
    otherRanged: {
      template: 'systems/deadlands-classic/templates/item/other.hbs',
    },
  };

  isEditable(options = {}) {
    return (options.editable ?? true) && super.isEditable;
  }

  async _prepareContext(options = {}) {
    const editable = (options.editable ?? true) && this.isEditable(options);

    return {
      editable,

      img: this.document.img,
      limited: this.document.limited,
      owner: this.document.isOwner,
      system: this.document.system,
      systemFields: this.document.system.schema.fields,

      options: this.options,
      title: this.title,
    };
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'header':
        context.name = {
          field: this.document.schema.getField('name'),
          value: this.document.name,
        };
        break;
      case 'otherRanged':
        context.data = {
          ammo: {
            tooltip: 'DLC.item.FIELDS.ammo.tooltip',
          },
          damage: {
            tooltip: 'DLC.item.FIELDS.damage.tooltip',
          },
          price: {
            tooltip: 'DLC.item.FIELDS.price.tooltip',
          },
          rangeIncrement: {
            tooltip: 'DLC.item.FIELDS.rangeIncrement.tooltip',
          },
          rof: {
            tooltip: 'DLC.item.FIELDS.rof.tooltip',
          },
        };
        context.description = {
          field: this.document.system.schema.getField('description'),
          enriched: await TextEditor.enrichHTML(this.item.system.description, {
            async: true,
          }),
          value: this.document.system.description,
        };
        break;
      default: // setting
    }
    return context;
  }

  /**
   * Process form submission for the sheet, removing overrides created by active effects
   * @this {EditOtherRangedSheet}             The handler is called with the application as its bound scope
   * @param {SubmitEvent} event           The originating form submission event
   * @param {HTMLFormElement} form        The form element that was submitted
   * @param {FormDataExtended} formData   Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async #onSubmitOtherRanged(event, form, formData) {
    const submitData = this._prepareSubmitData(event, form, formData);
    await this.document.update(submitData);
  }
}
