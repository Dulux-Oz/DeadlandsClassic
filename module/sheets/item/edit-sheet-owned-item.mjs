/* eslint-disable no-underscore-dangle */

const { api, sheets } = foundry.applications;

export class EditSheetOwnedItem extends api.HandlebarsApplicationMixin(
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
      handler: this.#onSubmitMisc,
      submitOnChange: true,
    },
  };

  static PARTS = {
    header: {
      template: 'systems/deadlands-classic/templates/item/header.hbs',
    },
    body: {
      template: 'systems/deadlands-classic/templates/item/owned-body.hbs',
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
      case 'body':
        context.hasQuantity = this.document.type === 'miscItem';
        context.quantity = context.hasQuantity
          ? this.document.system.quantity
          : 0;

        context.data = {
          price: {
            tooltip: 'DLC.item.FIELDS.price.tooltip',
          },
          quantity: {
            tooltip: 'DLC.item.FIELDS.quantity.tooltip',
          },
        };

        context.notes = {
          field: this.document.system.schema.getField('notes'),
          enriched: await TextEditor.enrichHTML(this.item.system.notes, {
            async: true,
          }),
          value: this.document.system.notes,
        };
        break;
      default:
    }
    return context;
  }

  /**
   * Process form submission for the sheet, removing overrides created by active effects
   * @this {EditMiscSheet}               The handler is called with the application as its bound scope
   * @param {SubmitEvent} event           The originating form submission event
   * @param {HTMLFormElement} form        The form element that was submitted
   * @param {FormDataExtended} formData   Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async #onSubmitMisc(event, form, formData) {
    const submitData = this._prepareSubmitData(event, form, formData);
    await this.document.update(submitData);
  }
}
