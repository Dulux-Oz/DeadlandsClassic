/* eslint-disable no-console */
import { aCards } from '../helpers/cards.mjs';

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

      const { hasPreviousTurns } = this.viewed;

      const redJoker = aCards[53];
      const blackJoker = aCards[52];

      context = foundry.utils.mergeObject(context, {
        blackJoker,
        hasPreviousTurns,
        offerEndTurn,
        redJoker,
        roundStarted,
      });
    }

    for (let index = 0; index < context.turns.length; index += 1) {
      const element = context.turns[index];

      // Retrieve the combatant that this turn refers to
      const combatant = this.viewed.getCombatantById(element.id);

      element.cards = combatant.cards; // array of integers
      element.cardObjects = combatant.cardObjects; // array of card objects

      // It's our turn, we are not using an override, we have normal card and no sleeved card.
      element.canSleeve =
        index === 0 &&
        !combatant.isOverridden &&
        !combatant.hasSleeved &&
        !!combatant.hasNormal;

      element.discards = combatant.discards; // array of integers
      element.discardObjects = combatant.discardObjects; // array of card objects

      element.hasBlackJoker = !!combatant.hasBlackJoker;
      element.hasNormal = !!combatant.hasNormal;
      element.hasRedJoker = !!combatant.hasRedJoker;
      element.hasSleeved = !!combatant.hasSleeved;

      element.isHostile = !!combatant.isHostile;
      element.isOverridden = !!combatant.isOverridden;
      element.isUsingJoker = !!combatant.isUsingJoker;

      element.usingSleeved = combatant.usingSleeved;

      element.isFriend = !combatant.isHostile || game.user.isGM;

      element.showControl =
        (combatant?.players?.includes(game.user) || game.user.isGM) &&
        this.viewed.roundStarted;

      element.showDiscards = !this.viewed.roundStarted;

      // It's always the first entry that's active in deadlands classic
      element.active = index === 0;
      element.hasRolled = false;
      element.roundStarted = this.viewed.roundStarted;
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
    const card = event.currentTarget;

    const li = card.closest('.combatant-hand');
    const combat = this.viewed;
    const c = combat.combatants.get(li.dataset.combatantId);

    const inx = card.dataset.index;
    const num = card.dataset.cardNumber;

    console.log('Card: ', num, ' is at index: ', inx);
    console.log(card.dataset);

    // eslint-disable-next-line eqeqeq
    if (num == 52 || num == 53) {
      return;
    }

    // Switch control action
    // eslint-disable-next-line default-case
    switch (card.dataset.control) {
      case 'discardCard':
        console.log('Delete card', inx);
        await game['deadlands-classic'].socket.executeAsGM(
          'socketDiscardCard',
          combat.id,
          c.id,
          inx
        );
        break;

      case 'retrieveCard':
        console.log('Undelete card', inx);
        await game['deadlands-classic'].socket.executeAsGM(
          'socketUndiscardCard',
          combat.id,
          c.id,
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
          combat.id,
          c.id
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
