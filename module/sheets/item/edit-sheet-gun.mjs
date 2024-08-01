/* eslint-disable no-underscore-dangle */

const { api, sheets } = foundry.applications;

export class EditGunSheet extends api.HandlebarsApplicationMixin(
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
      handler: this.#onSubmitGun,
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
    gun: {
      template: 'systems/deadlands-classic/templates/item/gun.hbs',
    },
  };

  async _prepareContext(options) {
    const { isEditable } = this;

    return {
      cssClass: isEditable ? 'editable' : 'locked',
      editable: isEditable,

      img: this.document.img,
      limited: this.document.limited,
      name: this.document.name,
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
      case 'gun':
        context.data = {
          calibre: {
            tooltip: 'DLC.item.FIELDS.calibre.tooltip',
          },
          damage: {
            tooltip: game.i18n.localize('DLC.item.FIELDS.damage.tooltip'),
          },
          price: {
            tooltip: game.i18n.localize('DLC.item.FIELDS.price.tooltip'),
          },
          rangeIncrement: {
            tooltip: 'DLC.item.FIELDS.rangeIncrement.tooltip',
          },
          rof: {
            tooltip: 'DLC.item.FIELDS.rof.tooltip',
          },
          shots: {
            tooltip: 'DLC.item.FIELDS.shots.tooltip',
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
      default: // header, setting
    }
    return context;
  }

  /**
   * Process form submission for the sheet, removing overrides created by active effects
   * @this {EditGunSheet}             The handler is called with the application as its bound scope
   * @param {SubmitEvent} event           The originating form submission event
   * @param {HTMLFormElement} form        The form element that was submitted
   * @param {FormDataExtended} formData   Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async #onSubmitGun(event, form, formData) {
    const submitData = this._prepareSubmitData(event, form, formData);
    await this.document.update(submitData);
  }
}
