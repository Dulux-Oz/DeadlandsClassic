import { Deck } from '../helpers/deck.mjs';
import { Hand } from '../helpers/hand.mjs';

export class DeadlandsCombat extends Combat {
  constructor(data, context) {
    super(data, context);

    this.allies = new Deck();
    this.axis = new Deck();

    const hasPrevious =
      typeof this.flags['deadlands-classic'] !== 'undefined' &&
      typeof this.flags['deadlands-classic'].previous !== 'undefined';

    if (hasPrevious) {
      this.previousTurns = this.getFlag('deadlands-classic', 'previous');
    } else {
      this.previousTurns = [];
    }

    this.roundStarted = false;
  }

  /*
   * Collect all the discards from combatants using a particular deck
   */
  reapDiscards(isHostile) {
    // Explicitly non ally, or default to ally
    const adversary = typeof isHostile === 'boolean' && isHostile;
    const deck = adversary ? this.axis : this.allies;

    this.turns.array.forEach((c) => {
      const { hand } = c;
      if (hand.isHostile === adversary) {
        const cards = hand.collectDiscards();
        deck.discard(cards);
      }
    });
  }

  /*
   * Collect every card from all combatants */
  reapAll() {
    this.turns.array.forEach((c) => {
      c.cleanUpAll();
    });
  }

  /**
   * Get the Combatant who has the current turn.
   * @type {Combatant}
   */
  get combatant() {
    return this.turns[0];
  }

  /**
   * Get a Combatant using its combatant id
   * @param {string} id   The id of the combatant being sought.
   * @returns {Combatant}
   */
  getCombatantById(id) {
    return this.combatants.find((c) => c.id === id);
  }

  /**
   * Get the Combatant who has the next turn.
   * @type {Combatant}
   */
  get nextCombatant() {
    return this.turns[1];
  }

  set initiative(foo) {
    this.initiative = foo;
  }

  /* -------------------------------------------- */

  /**
   * Begin the combat encounter, advancing to round 1 and turn 0. We store
   * turn 0 to indicate that the round hasn't started yet.
   * @returns {Promise<Combat>}
   */
  async startCombat() {
    this.#resetRoundData();

    // eslint-disable-next-line no-underscore-dangle
    this._playCombatSound('startEncounter');

    // turn zero, because no one has gone yet.
    const updateData = { round: 1, turn: 0 };
    Hooks.callAll('combatStart', this, updateData);
    return this.update(updateData);
  }

  /* -------------------------------------------- */

  /*
   * After all the cards have been drawn, start this round of combat.
   */
  async startRound() {
    this.turns.sort(DeadlandsCombat.#sortCombatants);
    this.roundStarted = true;

    const updateData = { round: this.round, turn: 1 };
    const updateOptions = {};

    Hooks.callAll('combatRound', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /* -------------------------------------------- */

  /**
   * Advance the combat to the next round
   * @returns {Promise<Combat>}
   */
  async nextRound() {
    this.#resetRoundData();

    const advanceTime = CONFIG.time.roundTime;
    const nextRound = this.round + 1;

    // Update the document, passing data through a hook first
    const updateData = { round: nextRound, turn: 0 };
    const updateOptions = { advanceTime, direction: 1 };
    Hooks.callAll('combatRound', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /* -------------------------------------------- */

  /**
   * Since all the cards have been discarded to the deck, it is not
   * possible to go to a previous round.
   * @returns {Promise<Combat>}
   */
  // eslint-disable-next-line class-methods-use-this, no-empty-function
  async previousRound() {}

  /* -------------------------------------------- */

  /**
   * Advance the combat to the next turn
   * @returns {Promise<Combat>}
   */
  async nextTurn() {
    const priorHand = Hand.fromObject(this.combatant.hand);

    const proir = {
      id: this.combatant.id,
      hand: priorHand,
    };

    this.previousTurns.push(proir);
    await this.setFlag('deadlands-classic', 'previous', this.previousTurns);

    this.combatant.endTurn();

    this.turns.sort(DeadlandsCombat.#sortCombatants);

    this.offerEndTurn = this.combatant.initiative === -1;

    const { round } = this;
    const turn = this.previousTurns.length;

    // Update the document, passing data through a hook first
    const updateData = { round, turn: 0 };
    const updateOptions = {};
    Hooks.callAll('combatTurn', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /* -------------------------------------------- */

  /**
   * Rewind the combat to the previous turn
   * @returns {Promise<Combat>}
   */
  async previousTurn() {
    if (this.previousTurns.length > 0) {
      const previousCombatant = this.previousTurns.pop();
      await this.setFlag('deadlands-classic', 'previous', this.previousTurns);

      const combatant = this.combatants.find(
        (c) => c.id === previousCombatant.id
      );

      if (typeof combatant !== 'undefined') {
        combatant.hand = previousCombatant.hand;
      }

      this.turns.sort((a, b) => a.initiative - b.initiative);
    }

    const turn = 0;

    // Update the document, passing data through a hook first
    const updateData = { round: this.round, turn };
    const updateOptions = {};
    Hooks.callAll('combatTurn', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /* -------------------------------------------- */

  /**
   * Set the turn back to zero, and clear the decks and previous turns.
   * @returns {Promise<Combat>}
   */
  async resetAll() {
    this.reapAll();
    this.previousTurns = [];

    return this.update(
      { turn: 0, combatants: this.combatants.toObject() },
      { diff: false }
    );
  }

  /* -------------------------------------------- */

  /**
   * Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name.
   * @returns {Combatant[]}
   */
  async setupTurns() {
    // Determine the turn order and the current turn
    this.turns = this.combatants.contents.sort(DeadlandsCombat.#sortCombatants);

    const hasPrevious =
      typeof this.flags['deadlands-classic'] !== 'undefined' &&
      typeof this.flags['deadlands-classic'].previous !== 'undefined';

    // Guard against getFlag throwing
    this.previousTurns = hasPrevious
      ? await this.getFlag('deadlands-classic', 'previous')
      : [];

    // Rebuild the canonical decks. Remove any card that is held elsewhere
    this.turns.forEach((c) => {
      const deck = c.isHostile ? this.axis : this.allies;
      deck.prune(c.contents);
    });

    // Update state tracking
    this.current = {
      round: this.round,
      turn: 0,
      combatantId: this.combatant ? this.combatant.id : null,
      tokenId: this.combatant ? this.combatant.tokenId : null,
    };

    // One-time initialization of the previous state
    if (!this.previous) this.previous = this.current;

    // Return the array of prepared turns
    return this.turns;
  }

  /* -------------------------------------------- */
  /*  Turn Events                                 */
  /* -------------------------------------------- */

  /**
   * Manage the execution of Combat lifecycle events.
   * This method orchestrates the execution of four events in the following order, as applicable:
   * 1. End Turn
   * 2. End Round
   * 3. Begin Round
   * 4. Begin Turn
   * Each lifecycle event is an async method, and each is awaited before proceeding.
   * @param {number} [adjustedTurn]   Optionally, an adjusted turn to commit to the Combat.
   * @returns {Promise<void>}
   * @protected
   */
  // eslint-disable-next-line no-underscore-dangle
  async _manageTurnEvents(adjustedTurn) {
    if (!game.users.activeGM?.isSelf) return;

    // If there is no previous
    const prior = this.combatants.get(this.previous?.combatantId);

    // Adjust the turn order before proceeding. Used for embedded document workflows
    if (Number.isNumeric(adjustedTurn))
      await this.update({ turn: adjustedTurn }, { turnEvents: false });
    if (!this.started) return;

    // Identify what progressed
    const advanceRound = this.current.round > (this.previous?.round ?? -1);
    const advanceTurn = this.current.turn > (this.previous?.turn ?? -1);
    if (!(advanceTurn || advanceRound)) return;

    // Conclude prior turn
    // eslint-disable-next-line no-underscore-dangle
    if (prior) await this._onEndTurn(prior);

    // Conclude prior round
    // eslint-disable-next-line no-underscore-dangle
    if (advanceRound && this.previous?.round !== null) await this._onEndRound();

    // Begin new round
    // eslint-disable-next-line no-underscore-dangle
    if (advanceRound) await this._onStartRound();

    // Begin a new turn
    // eslint-disable-next-line no-underscore-dangle
    await this._onStartTurn(this.combatant);
  }

  /**
   * process the combat between rounds.
   * @returns {Promise<Combat>}
   */
  async #resetRoundData() {
    // No previous turns
    this.previousTurns = [];
    await this.setFlag('deadlands-classic', 'previous', this.previousTurns);

    // Collect all the cards that are discarded at turn end
    this.turns.forEach((e) => {
      e.cleanUpRound();
    });

    // Make sure each deck has exactly 54 cards. following this, All the cards
    // not up a combatant's sleeve are in the available or in the discard pile
    // of the deck itself.

    this.#reconcileDeck(true);
    this.#reconcileDeck(false);

    if (this.axis.needsShuffled) {
      this.axis.recycle();
    }
    if (this.allies.needsShuffled) {
      this.allies.recycle();
    }

    this.turns.sort(DeadlandsCombat.#sortCombatants);

    this.roundStarted = false;
    this.offerEndTurn = false;
  }

  /* -------------------------------------------- */

  #reconcileDeck(enemy) {
    // Explicitly non ally, or default to ally
    const adversary = typeof enemy === 'boolean' && !!enemy;
    const deck = adversary ? this.axis : this.allies;

    // Gather up a copy of all the cards that are held by combatants
    const cards = [];
    this.turns.forEach((c) => {
      if (c.hand.isHostile === adversary) {
        cards.push(c.hand.contents);
      }
    });

    // Make the deck consistent with these cards having been drawn
    // and all other cards either not drawn, or discarded. Deck
    // should have exactly 54 cards when finished.
    deck.reconcile(cards);
  }

  /* -------------------------------------------- */

  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * @param {Combatant} a     Some combatant
   * @param {Combatant} b     Some other combatant
   */
  static #sortCombatants(a, b) {
    const ia = Deck.isCard(a.initiative) ? Math.floor(a.initiative) : -1;
    const ib = Deck.isCard(b.initiative) ? Math.floor(b.initiative) : -1;

    if (ib - ia === 0) {
      if (ia !== -1) {
        return a.isHostile ? -1 : 1;
      }
      return a.id - b.id;
    }

    return ib - ia;
  }
}
