/* eslint-disable no-underscore-dangle */
export class DeadlandsItemDirectory extends ItemDirectory {
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
