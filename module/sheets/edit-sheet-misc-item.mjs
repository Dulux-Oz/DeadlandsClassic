import { ItemSheetBase } from './item-sheet-base.mjs';

export class EditMiscItemSheet extends ItemSheetBase {
  constructor(data, options = {}) {
    super(data, options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template:
        'systems/deadlands-classic/templates/item/edit-misc-item-sheet.html',
    });
  }

  /** @override */
  async getData(options) {
    let context = await super.getData(options);

    context = foundry.utils.mergeObject(context, {});

    return context;
  }
}
