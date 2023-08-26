import { Deck } from './deck.js';

export class DeadlandsCombat extends Combat {
  constructor(data, context) {
    super(data, context);

    this.allies = new Deck();
    this.axis = new Deck();

    if (typeof this.data.flags.deadlands.previous !== 'undefined') {
      this.previousTurns = this.getFlag('deadlands', 'previous');
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
   * Get the Combatant who has the next turn.
   * @type {Combatant}
   */
  get nextCombatant() {
    return this.turns[1];
  }

  // Is plus one because when there are no previous turns this is turn
  // one, not turn zero.
  get turn() {
    return this.previousTurns.length + 1;
  }

  /* -------------------------------------------- */

  /**
   * Begin the combat encounter, advancing to round 1 and turn 0. We store turn 0 to indicate that the round hasn't started
   * this.turn will return 1
   * @returns {Promise<Combat>}
   */
  async startCombat() {
    this.resetRoundData();

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
    this.turns.sort(DeadlandsCombat.sortCombatants);
    this.roundStarted = true;

    const updateData = { round: this.round, turn: 1 };
    const updateOptions = {};

    Hooks.callAll('combatRound', this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /* -------------------------------------------- */

  /**
   * process the combat between rounds.
   * @returns {Promise<Combat>}
   */
  async resetRoundData() {
    // No previous turns (makes this.turn return 1)
    this.previousTurns = [];
    await this.setFlag('deadlands', 'previous', this.previousTurns);

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

    this.turns.sort(DeadlandsCombat.sortCombatants);

    this.roundStarted = false;
  }

  /* -------------------------------------------- */

  /**
   * Advance the combat to the next round
   * @returns {Promise<Combat>}
   */
  async nextRound() {
    this.resetRoundData();

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
    // When the round has not started, combat is paused to let
    // combatants draw cards.  In this case, nextTurn sorts the combatants by
    // the cards they have drawn and moves into the round proper.

    const priorHand = foundry.utils.deepClone(this.combatant.hand);

    const proir = {
      id: this.combatant.id,
      hand: priorHand,
    };

    this.previousTurns.push(proir);
    await this.setFlag('deadlands', 'previous', this.previousTurns);

    this.combatant.endTurn();

    if (this.combatant.initiative === -1) {
      return this.nextRound();
    }

    const { round } = this;

    // Update the document, passing data through a hook first
    const updateData = { round, turn: this.turn };
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
      await this.setFlag('deadlands', 'previous', this.previousTurns);

      const combatant = this.combatants.find(
        (c) => c.id === previousCombatant.id
      );

      if (typeof combatant !== 'undefined') {
        combatant.hand = previousCombatant.hand;
      }

      this.turns.sort((a, b) => a.initiative - b.initiative);
    }

    // Update the document, passing data through a hook first
    const updateData = { round: this.round, turn: this.turn };
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
    this.turns = this.combatants.contents.sort(DeadlandsCombat.sortCombatants);

    // Guard against getFlag throwing
    this.previousTurns =
      typeof this.data.flags.deadlands.previousTurns !== 'undefined'
        ? await this.getFlag('deadlands', 'previousTurns')
        : [];

    // Rebuild the canonical decks. Remove any card that is held elsewhere
    this.turns.array.forEach((c) => {
      const deck = c.isHostile ? this.axis : this.allies;
      deck.prune(c.contents());
    });

    // Update state tracking
    this.current = {
      round: this.round,
      turn: this.turn,
      combatantId: this.combatant ? this.combatant.id : null,
      tokenId: this.combatant ? this.combatant.tokenId : null,
    };

    // One-time initialization of the previous state
    if (!this.previous) this.previous = this.current;

    // Return the array of prepared turns
    return this.turns;
  }

  /* -------------------------------------------- */

  #reconcileDeck(enemy) {
    // Explicitly non ally, or default to ally
    const adversary = typeof enemy === 'boolean' && !!enemy;
    const deck = adversary ? this.axis : this.allies;

    // Gather up a copy of all the cards that are held by combatants
    const cards = [];
    this.turns.array.forEach((c) => {
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
  static sortCombatants(a, b) {
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
