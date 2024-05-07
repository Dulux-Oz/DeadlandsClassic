export class EditEdgeSheet extends ItemSheet {
  constructor(data, options = {}) {
    // setting up tabs here instead of in defaultOptions so that we can easily set the initial tab
    // eslint-disable-next-line no-param-reassign
    options.tabs = [
      {
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'configure',
      },
    ];
    super(data, options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'item'],
      template: 'systems/deadlands-classic/templates/item/edit-edge-sheet.html',
      width: 660,
      height: 800,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
    });
  }

  /** @override */
  async getData(options) {
    const { isEditable } = this;

    const context = {
      cssClass: isEditable ? 'editable' : 'locked',
      editable: isEditable,
      limited: this.document.limited,
      name: this.title,
      options: this.options,
      owner: this.document.isOwner,
      system: this.item.system,
      title: this.title,
      img: this.document.img,
    };

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
