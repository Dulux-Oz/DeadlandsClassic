export class EditGunSheet extends ItemSheet {
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
      template: 'systems/deadlands-classic/templates/item/edit-gun-sheet.html',
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

    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      { async: true }
    );

    context.enrichedNotes = await TextEditor.enrichHTML(
      this.item.system.notes,
      { async: true }
    );

    return context;
  }
}
