import { ItemSheetBase } from './item-sheet-base.mjs';

export class ShowEdgeSheet extends ItemSheetBase {
  constructor(data, options = {}) {
    super(data, options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: 'systems/deadlands-classic/templates/item/show-edge-sheet.html',
    });
  }

  /** @override */
  async getData(options) {
    let context = await super.getData(options);

    context = foundry.utils.mergeObject(context, {
      cssClass: 'locked',
      editable: false,
    });

    context.enrichedBlurb = await TextEditor.enrichHTML(
      this.item.system.blurb,
      { async: true }
    );

    context.enrichedOneText = await TextEditor.enrichHTML(
      this.item.system.one.text,
      { async: true }
    );

    context.enrichedTwoText = await TextEditor.enrichHTML(
      this.item.system.two.text,
      { async: true }
    );

    context.enrichedThreeText = await TextEditor.enrichHTML(
      this.item.system.three.text,
      { async: true }
    );

    context.enrichedFourText = await TextEditor.enrichHTML(
      this.item.system.four.text,
      { async: true }
    );

    context.enrichedFiveText = await TextEditor.enrichHTML(
      this.item.system.five.text,
      { async: true }
    );

    context.enrichedCapstoneText = await TextEditor.enrichHTML(
      this.item.system.capstone.text,
      { async: true }
    );
    return context;
  }
}
