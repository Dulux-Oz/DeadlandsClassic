/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */

export class DeadlandsItemDirectory extends ItemDirectory {
  async #getDocument(documentId) {
    return (
      this.collection.get(documentId) ??
      (await this.collection.getDocument(documentId))
    );
  }

  /* -------------------------------------------- */

  /** @override */
  async _onClickEntryName(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const { documentId } = element.parentElement.dataset;
    const item = await this.#getDocument(documentId);

    if (item.isCharacterMod) {
      item.sheet.render(true);
    } else {
      item.itemEditor.render({ force: true, editable: false });
    }
  }

  /** @override */
  _getEntryContextOptions() {
    const options = super._getEntryContextOptions();
    return [
      {
        name: 'DLC.sidebar.EditItem',
        icon: '<i class="fas fa-pencil"></i>',
        condition: (li) => true,
        callback: (li) => {
          const item = game.items.get(li.data('documentId'));
          item.itemEditor.render(true);
        },
      },
    ].concat(options);
  }
}
