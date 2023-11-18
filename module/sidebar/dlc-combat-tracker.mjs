/* eslint-disable no-console */

export class DeadlandsCombatTracker extends CombatTracker {
  /* global CanonicalCards */
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

    const roundStarted = !!this.viewed?.roundStarted;
    const offerEndTurn = !!this.viewed?.offerEndTurn;

    if (this.viewed !== null && typeof this.viewed !== 'undefined') {
      const { hasPreviousTurns } = this.viewed;

      const redJoker = CanonicalCards.cardByIndex(CanonicalCards.rJokerIndex);
      const blackJoker = CanonicalCards.cardByIndex(CanonicalCards.bJokerIndex);

      const nextCombatant = this.viewed.combatant;
      const showNextTurn = nextCombatant?.isOverridden;

      context = foundry.utils.mergeObject(context, {
        blackJoker,
        hasPreviousTurns,
        offerEndTurn,
        redJoker,
        roundStarted,
        showNextTurn,
      });
    }

    for (let index = 0; index < context.turns.length; index += 1) {
      const element = context.turns[index];

      // Retrieve the combatant that this turn refers to
      const combatant = this.viewed.getCombatantById(element.id);

      element.cards = combatant.cards; // array of integers
      element.cardObjects = combatant.cardObjects; // array of card objects

      // It's our turn, we are not using an override, we have a normal card and no sleeved card.
      element.canSleeve =
        index === 0 &&
        !combatant.isUsingSleeved &&
        !combatant.isUsingRedJoker &&
        !combatant.isUsingBlackJoker &&
        !combatant.hasSleeved &&
        !!combatant.hasNormal;

      element.discards = combatant.discards; // array of integers
      element.discardObjects = combatant.discardObjects; // array of card objects

      element.hasBlackJoker = !!combatant.hasBlackJoker;
      element.hasNormal = !!combatant.hasNormal;
      element.hasRedJoker = !!combatant.hasRedJoker;

      element.showBlackControl =
        !!combatant.hasBlackJoker &&
        !combatant.isUsingRedJoker &&
        !combatant.isUsingSleeved;

      element.showRedControl =
        !!combatant.hasRedJoker &&
        !combatant.isUsingBlackJoker &&
        !combatant.isUsingSleeved;

      element.showSleeveControl =
        element.canSleeve &&
        !combatant.isUsingRedJoker &&
        !combatant.isUsingBlackJoker;

      element.showUseSleeveControl =
        !!combatant.hasSleeved &&
        !combatant.isUsingRedJoker &&
        !combatant.isUsingBlackJoker;

      element.showVamoose = !!combatant.hasNormal || !combatant.isOverridden;

      element.isHostile = !!combatant.isHostile;
      element.isUsingSleeved = !!combatant.isUsingSleeved;
      element.isUsingRedJoker = !!combatant.isUsingRedJoker;
      element.isUsingBlackJoker = !!combatant.isUsingBlackJoker;

      element.usingSleeved = combatant.usingSleeved;

      element.isFriend = !combatant.isHostile || game.user.isGM;

      element.showControl =
        (combatant?.players?.includes(game.user) || game.user.isGM) &&
        roundStarted;

      element.showDiscards = !roundStarted;

      // It's always the first entry that's active in deadlands classic
      element.active = index === 0;
      element.hasRolled = false;
      element.roundStarted = roundStarted;
    }

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Combatant control
    // eslint-disable-next-line no-underscore-dangle
    html.find('.combatant-cards').click((ev) => this.#onCombatantCards(ev));

    // eslint-disable-next-line no-underscore-dangle
    html.find('.combatant-discards').click((ev) => this.#onCombatantCards(ev));
  }

  /**
   * Handle a Combatant control toggle
   * @private
   * @param {Event} event   The originating mousedown event
   */
  async #onCombatantCards(event) {
    event.preventDefault();
    event.stopPropagation();

    // No discarding or retrieving cards mid round
    if (this.viewed?.roundStarted) {
      return;
    }

    const card = event.currentTarget;
    const num = Number(card.dataset.cardNumber);

    const li = card.closest('.combatant-hand');
    const combat = this.viewed;
    const combatant = combat.combatants.get(li.dataset.combatantId);

    const isFriend = !combatant.isHostile;
    const wildRed =
      num === CanonicalCards.rJokerIndex &&
      game.settings.get('deadlands-classic', 'wildRed');
    const wildBlack =
      num === CanonicalCards.bJokerIndex &&
      game.settings.get('deadlands-classic', 'wildBlack');

    const ignore = isFriend || wildRed || wildBlack;

    // If the card clicked is a joker, ignore this
    if (CanonicalCards.isJoker(num) && ignore) {
      return;
    }

    const inx = card.dataset.index;

    console.log('Card: ', num, ' is at index: ', inx);
    console.log(card.dataset);

    // Switch control action
    // eslint-disable-next-line default-case
    switch (card.dataset.control) {
      case 'discardCard':
        console.log('Delete card', inx);
        await game['deadlands-classic'].socket.executeAsGM(
          'socketDiscardCard',
          combat.id,
          combatant.id,
          inx
        );
        break;

      case 'retrieveCard':
        console.log('Undelete card', inx);
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUndiscardCard',
          combat.id,
          combatant.id,
          inx
        );
        break;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle click events on Combat control buttons
   * @private
   * @param {Event} event   The originating mousedown event
   */
  // eslint-disable-next-line no-underscore-dangle
  async _onCombatControl(event) {
    event.preventDefault();
    const combat = this.viewed;

    const ctrl = event.currentTarget;
    if (ctrl.getAttribute('disabled')) {
      return;
    }
    ctrl.setAttribute('disabled', true);

    if (ctrl.dataset.control === 'nextTurn') {
      await game['deadlands-classic'].socket.executeAsGM(
        'socketNextTurn',
        combat.id
      );
    } else {
      // 'startCombat' 'startRound' 'nextRound' 'endCombat'

      const fn = combat[ctrl.dataset.control];
      if (fn) {
        await fn.bind(combat)();
      }
    }

    ctrl.removeAttribute('disabled');
  }

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

      /*
       * These all need GM permissions to modify the combat */

      // Draw a card
      case 'drawCard':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketDrawCard',
          combat.id,
          c.id
        );
        break;

      // Sleeve the highest card
      case 'sleeveHighest':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketSleeveHighest',
          combat.id
        );
        break;

      // Toggle the use joker
      case 'toggleBlackJoker':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketToggleBlackJoker',
          combat.id,
          c.id
        );
        break;

      case 'toggleHostility':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketToggleHostility',
          combat.id,
          c.id
        );
        break;

      // Toggle the use joker
      case 'toggleRedJoker':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketToggleRedJoker',
          combat.id,
          c.id
        );
        break;

      case 'toggleSleeved':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketToggleSleeved',
          combat.id,
          c.id
        );
        break;

      case 'vamoose':
        await game['deadlands-classic'].socket.executeAsGM(
          'socketVamoose',
          combat.id,
          c.id
        );
    }
  }
}
