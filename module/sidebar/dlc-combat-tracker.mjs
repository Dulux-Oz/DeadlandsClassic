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

      // Retrieve the combatant that this turn refers to
      const combatant = this.viewed.getCombatantById(element.id);

      element.cards = combatant.cards; // array of integers
      element.cardObjects = combatant.cardObjects; // array of card objects

      element.discards = combatant.discards; // array of integers
      element.discardObjects = combatant.discardObjects; // array of card objects

      element.hasBlackJoker = !!combatant.hasBlackJoker;
      element.hasNormal = !!combatant.hasNormal;
      element.hasRedJoker = !!combatant.hasRedJoker;
      element.hasSleeved = !!combatant.hasSleeved;

      // It's our turn, we are not using an override, we have normal card and no sleeved card.
      element.canSleeve =
        index === 0 &&
        combatant.initiative <= 51 &&
        !combatant.hasSleeved &&
        !!combatant.hasNormal;

      element.usingSleeved = combatant.usingSleeved;

      // It's always the first entry that's active in deadlands classic
      element.active = index === 0;
      element.hasRolled = false;
      element.roundStarted = this.viewed.roundStarted;
    }

    return context;
  }

  /* -------------------------------------------- */

  /**
   * Handle a Combatant control toggle
   * @private
   * @param {Event} event   The originating mousedown event
   */
  // eslint-disable-next-line no-underscore-dangle, consistent-return
  async _onCombatantControl(event) {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const li = btn.closest('.combatant');
    const combat = this.viewed;
    const c = combat.combatants.get(li.dataset.combatantId);

    // Switch control action
    // eslint-disable-next-line default-case
    switch (btn.dataset.control) {
      // Toggle combatant visibility
      case 'toggleHidden':
        return c.update({ hidden: !c.hidden });

      // Toggle combatant defeated flag
      case 'toggleDefeated':
        // eslint-disable-next-line no-underscore-dangle
        return this._onToggleDefeatedStatus(c);

      // Actively ping the Combatant
      case 'pingCombatant':
        // eslint-disable-next-line no-underscore-dangle
        return this._onPingCombatant(c);

      // Draw a card
      case 'drawCard':
        // eslint-disable-next-line no-underscore-dangle
        return c.draw(1);

      // Roll combatant initiative
      // case 'rollInitiative':
      // return combat.rollInitiative([c.id]);
    }
  }
}
