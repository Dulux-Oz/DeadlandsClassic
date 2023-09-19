import { Deck } from '../helpers/deck.mjs';
import { Hand } from '../helpers/hand.mjs';

export class DeadlandsCombat extends Combat {
  constructor(data, context) {
    super(data, context);

    // Make brand new decks with 54 cards ready to be drawn
    this.ally = new Deck();
    this.axis = new Deck();

    this.roundStarted = false;
  }

  /*
   * Handle all the database jiggery pokery that keeps the various clients in synch.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    const hasRoundState =
      typeof this.flags['deadlands-classic'] !== 'undefined' &&
      typeof this.flags['deadlands-classic'].roundState !== 'undefined';

    if (hasRoundState) {
      const deckRec = this.getFlag('deadlands-classic', 'roundState');

      this.axis.cards = deckRec.axisCards.filter(
        (item, index) => deckRec.axisCards.indexOf(item) === index
      );

      this.axis.discards = deckRec.axisDiscards.filter(
        (item, index) => deckRec.axisDiscards.indexOf(item) === index
      );

      this.ally.cards = deckRec.allyCards.filter(
        (item, index) => deckRec.allyCards.indexOf(item) === index
      );

      this.ally.discards = deckRec.allyDiscards.filter(
        (item, index) => deckRec.allyDiscards.indexOf(item) === index
      );

      this.roundStarted = !!deckRec.roundStarted;
    }

    const hasPreviousTurns =
      typeof this.flags['deadlands-classic'] !== 'undefined' &&
      typeof this.flags['deadlands-classic'].previousTurns !== 'undefined';

    if (hasPreviousTurns) {
      this.previousTurns = this.getFlag('deadlands-classic', 'previousTurns');
    } else {
      this.previousTurns = [];
    }
  }

  /*
   * Collect all the discards from combatants using a particular deck
   */
  reapDiscards(isHostile) {
    // Explicitly non ally, or default to ally
    const adversary = typeof isHostile === 'boolean' && isHostile;

    const collection = [];
    this.turns.forEach((c) => {
      const { hand } = c;
      if (hand.isHostile === adversary) {
        const cards = hand.collectDiscards();
        collection.push(...cards);
      }
    });

    const deck = adversary ? this.axis : this.ally;
    deck.discard(collection);
    deck.recycle();

    this.storeRoundData();
  }

  /*
   * Collect every card from all combatants
   */

  reapAll() {
    const allyCards = [];
    const axisCards = [];

    this.turns.forEach((c) => {
      if (c.isHostile) {
        axisCards.push(c.cleanUpAll());
      } else {
        allyCards.push(c.cleanUpAll());
      }

      c.updateInitiative();
    });

    this.ally.discard(allyCards);
    this.axis.discard(axisCards);
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

  get hasPreviousTurns() {
    return this.previousTurns.length > 0;
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

  sortCombatants() {
    this.turns.sort(DeadlandsCombat.#sortCombatants);
  }

  async sendUpdate() {
    await this.setFlag('deadlands-classic', 'nonsense', false);
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

  async updateCombatData() {
    this.turns.forEach((c) => {
      c.updateInitiative();
    });

    this.sortCombatants();

    this.storeRoundData();
  }

  /*
   * After all the cards have been drawn, start this round of combat.
   */
  async startRound() {
    this.roundStarted = true;

    this.updateCombatData();

    const updateData = { round: this.round, turn: 0 };
    const updateOptions = {};

    Hooks.callAll('combatRound', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /* -------------------------------------------- */

  /**
   * Advance the combat to the gap between rounds
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
    // deep clone does not produce a deep clone. Make a new object from the current data
    // This will not have references to the original arrays in this.combatant.hand
    const priorHand = Hand.fromObject(this.combatant.hand);

    const proir = {
      id: this.combatant.id,
      hand: priorHand,
    };

    this.previousTurns.push(proir);
    await this.setFlag(
      'deadlands-classic',
      'previousTurns',
      this.previousTurns
    );

    this.combatant.endTurn();

    this.sortCombatants();

    this.offerEndTurn = this.combatant.initiative === -1;

    const { round } = this;
    const turn = this.previousTurns.length;

    // Update the document, passing data through a hook first
    const updateData = { round, turn: 0 };
    const updateOptions = {};
    Hooks.callAll('combatTurn', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /**
   * Advance the combat to the next turn
   * @returns {Promise<Combat>}
   */
  async vamoose(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return null;

    // deep clone does not produce a deep clone. Make a new object from the current data
    // This will not have references to the original arrays in this.combatant.hand
    const priorHand = Hand.fromObject(combatant.hand);

    const proir = {
      id: combatant.id,
      hand: priorHand,
    };

    this.previousTurns.push(proir);
    await this.setFlag(
      'deadlands-classic',
      'previousTurns',
      this.previousTurns
    );

    combatant.endTurn();

    this.sortCombatants();

    this.offerEndTurn = this.combatant.initiative === -1;

    const { round } = this;
    const turn = this.previousTurns.length;

    // Update the document, passing data through a hook first
    const updateData = { round, turn };
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

      await this.setFlag(
        'deadlands-classic',
        'previousTurns',
        this.previousTurns
      );

      const combatant = this.combatants.find(
        (c) => c.id === previousCombatant.id
      );

      if (typeof combatant !== 'undefined') {
        combatant.setHand(previousCombatant.hand);
      }

      this.sortCombatants();
    }

    this.offerEndTurn = this.combatant.initiative === -1;
    const turn = this.previousTurns.length;

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

    this.#clearRoundData();

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
    const hasPreviousTurns =
      typeof this.flags['deadlands-classic'] !== 'undefined' &&
      typeof this.flags['deadlands-classic'].previousTurns !== 'undefined';

    // Guard against getFlag throwing
    this.previousTurns = hasPreviousTurns
      ? await this.getFlag('deadlands-classic', 'previousTurns')
      : [];

    // Determine the turn order and the current turn
    this.turns = [...this.combatants];

    if (this.roundStarted) {
      this.sortCombatants();
    }

    // Rebuild the canonical decks. Remove any card that is held elsewhere
    this.turns.forEach((c) => {
      const deck = c.isHostile ? this.axis : this.ally;
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

  /* -------------------------------------------- */

  async #clearRoundData() {
    await this.unsetFlag('deadlands-classic', 'previousTurns');
    await this.unsetFlag('deadlands-classic', 'roundState');
  }

  /* -------------------------------------------- */

  async storeRoundData() {
    const roundState = {
      axisCards: this.axis.cards,
      axisDiscards: this.axis.discards,
      allyCards: this.ally.cards,
      allyDiscards: this.ally.discards,
      roundStarted: this.roundStarted,
    };
    await this.setFlag('deadlands-classic', 'roundState', roundState);

    await this.setFlag(
      'deadlands-classic',
      'previousTurns',
      this.previousTurns
    );
  }

  /* -------------------------------------------- */

  /**
   * process the combat between rounds.
   * @returns {Promise<Combat>}
   */
  async #resetRoundData() {
    await this.unsetFlag('deadlands-classic', 'previousTurns');
    // No previous turns
    this.previousTurns = [];

    // Collect all the cards that are discarded at turn end
    const allyCards = [];
    const allyHeld = [];

    const axisCards = [];
    const axisHeld = [];

    this.turns.forEach((c) => {
      if (c.isHostile) {
        axisCards.push(c.cleanUpRound());
        axisHeld.push(...c.hand.contents);
      } else {
        allyCards.push(c.cleanUpRound());
        allyHeld.push(...c.hand.contents);
      }

      c.updateInitiative();
    });

    this.ally.discard(allyCards);
    this.axis.discard(axisCards);

    // Make the deck consistent with these cards having been drawn
    // and all other cards either not drawn, or discarded. Deck
    // should have exactly 54 cards when finished.
    this.ally.reconcile(allyHeld);
    this.axis.reconcile(axisHeld);

    if (this.axis.needsShuffled) {
      this.axis.recycle();
    }
    if (this.ally.needsShuffled) {
      this.ally.recycle();
    }

    this.roundStarted = false;
    this.offerEndTurn = false;

    this.storeRoundData();

    this.sortCombatants();
  }

  /*
   * Look up the combatant and check if there are cards available in its deck.
   *
   * If no cards are available, the function collects any discards from
   * combatants allied to this combatant back to the deck.
   *
   * If that doesn't fix the lack of cards, then the function stops
   * trying to allocate one.
   */

  async draw(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    const deck = combatant.isHostile ? this.axis : this.ally;

    if (!deck.canDraw) {
      this.reapDiscards(this.isHostile);
    }

    if (deck.canDraw) {
      const card = deck.draw();
      combatant.addCard(card);
    }

    this.updateCombatData();
  }

  async sleeveHighest(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    combatant.sleeveHighest();
    this.updateCombatData();
  }

  async toggleHostility(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    // Back to the original deck
    const deck = combatant.isHostile ? this.axis : this.ally;
    deck.discard(combatant.contents);

    // change to the other deck
    combatant.hand.isHostile = !combatant.hand.isHostile;
    combatant.cleanUpAll();

    this.storeRoundData();
  }

  async toggleSleeved(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    combatant.toggleSleeved();
    this.updateCombatData();
  }

  async toggleRedJoker(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    combatant.toggleRedJoker();
    this.updateCombatData();
  }

  async toggleBlackJoker(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    combatant.toggleBlackJoker();
    this.updateCombatData();
  }

  /* -------------------------------------------- */

  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * @param {Combatant} a     Some combatant
   * @param {Combatant} b     Some other combatant
   */
  static #sortCombatants(a, b) {
    const ia = a.initiative;
    const ib = b.initiative;

    if (ib - ia === 0) {
      if (ia !== -1) {
        return a.isHostile ? -1 : 1;
      }
      return a.id - b.id;
    }

    return ib - ia;
  }
}
