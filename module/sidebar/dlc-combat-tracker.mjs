export class DeadlandsCombatTracker extends CombatTracker {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(
      super.defaultOptions,
      {
        template:
          'systems/deadlands-classic/templates/sidebar/combat-tracker.html',
      },
      { overwrite: true }
    );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options = {}) {
    let context = await super.getData(options);

    if (this.viewed !== null && typeof this.viewed !== 'undefined') {
      const roundStarted =
        this.viewed.roundStarted != null &&
        typeof this.viewed.roundStarted !== 'undefined'
          ? !!this.viewed.roundStarted
          : false;

      const offerEndTurn =
        this.viewed.offerEndTurn != null &&
        typeof this.viewed.offerEndTurn !== 'undefined'
          ? !!this.viewed.offerEndTurn
          : false;

      context = foundry.utils.mergeObject(context, {
        roundStarted,
        offerEndTurn,
      });
    }

    for (let index = 0; index < context.turns.length; index += 1) {
      const element = context.turns[index];

      // It's always the first entry that active in deadlands classic
      element.active = index === 0;
      element.hasRolled = false;
      element.roundStarted = this.viewed.roundStarted;
    }

    return context;
  }
}
