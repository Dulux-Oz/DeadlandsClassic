/* eslint-disable no-underscore-dangle */
export class DeadlandsActorDirectory extends ActorDirectory {
  /** @override */
  static entryPartial =
    'systems/deadlands-classic/templates/sidebar/partials/dlc-actor-partial.html';

  /** @override */
  _getEntryContextOptions() {
    const options = super._getEntryContextOptions();
    return [
      {
        name: 'DLC.sidebar.UseChips',
        icon: '<i class="fas fa-circle"></i>',
        condition: (li) => true,
        callback: (li) => {
          const actor = game.actors.get(li.data('documentId'));
          if (actor.system.ActiveForChips) {
            delete actor.apps?.[globalThis.ChipManager.appId];
          } else {
            actor.apps[globalThis.ChipManager.appId] = globalThis.ChipManager;
          }
          actor.system.ActiveForChips = !actor.system.ActiveForChips;
          actor.update();
        },
      },
    ].concat(options);
  }
}
