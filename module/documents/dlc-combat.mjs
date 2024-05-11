/* global CanonicalCards */

import { Deck } from '../helpers/deck.mjs';
import * as utility from '../helpers/dlc-utilities.mjs';
import { Hand } from '../helpers/hand.mjs';

export class DeadlandsCombat extends Combat {
  constructor(data, context) {
    super(data, context);

    // Make brand new decks with 54 cards ready to be drawn
    this.ally = new Deck();
    this.axis = new Deck();

    this.didInterRound = false;
    this.roundStartedOld = false;
    this.roundStarted = false;
  }

  /*
   * Handle all the database jiggery pokery that keeps the various clients in synch.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    const deckRec = this.getFlag('deadlands-classic', 'roundState');

    if (deckRec !== undefined) {
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

    this.roundStartedOld =
      this.getFlag('deadlands-classic', 'roundStartedOld') ?? false;

    this.previousTurns =
      this.getFlag('deadlands-classic', 'previousTurns') ?? [];
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
    this.roundStartedOld = false;
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
    this.didInterRound = false;
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

  /*
   * This method removes the highest card on a combatant. If the second parameter is false,
   * the card will be sleeved, otherwise it goes to discards. The function stores a copy
   * of the combatant's hand to previous turns so this can be undone, then updates the
   * combat.
   */

  async #moveActiveCardToHistory(combatant, endTurn = true) {
    // deep clone does not produce a deep clone. Make a new object from the current data
    // This will not have references to the original arrays in this.combatant.hand
    const priorHand = Hand.fromObject(combatant.hand);

    const proir = {
      id: combatant.id,
      hand: priorHand,
    };

    this.roundStartedOld = true;
    this.previousTurns.push(proir);

    await this.storeTurnData();

    if (endTurn) {
      combatant.endTurn();
    } else {
      combatant.sleeveHighest();
    }

    return this.#updateCombatState();
  }

  #updateCombatState() {
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
   * Advance the combat to the next turn
   */
  async nextTurn() {
    // eslint-disable-next-line no-return-await
    return await this.#moveActiveCardToHistory(this.combatant);
  }

  /**
   * Let any combatant use their highest card to vamoose
   */
  async vamoose(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return null;

    // eslint-disable-next-line no-return-await
    return await this.#moveActiveCardToHistory(combatant);
  }

  /*
   * Only the acting combatant can sleeve a card.
   */
  async sleeveHighest() {
    // eslint-disable-next-line no-return-await
    return await this.#moveActiveCardToHistory(this.combatant, false);
  }

  /* -------------------------------------------- */

  /**
   * Rewind the combat to the previous turn
   * @returns {Promise<Combat>}
   */
  async previousTurn() {
    if (this.previousTurns.length <= 0) {
      return null;
    }

    const previousCombatant = this.previousTurns.pop();

    await this.storeTurnData();

    const combatant = this.combatants.find(
      (c) => c.id === previousCombatant.id
    );

    if (typeof combatant !== 'undefined') {
      combatant.setHand(previousCombatant.hand);
    }

    return this.#updateCombatState();
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
    this.previousTurns = this.flags['deadlands-classic']?.previousTurns ?? [];

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

  async #clearRoundData() {
    await this.unsetFlag('deadlands-classic', 'previousTurns');
    await this.unsetFlag('deadlands-classic', 'roundState');
    await this.unsetFlag('deadlands-classic', 'roundStartedOld');
  }

  /* -------------------------------------------- */

  async storeTurnData() {
    const updateData = {
      flags: {
        'deadlands-classic': {
          previousTurns: this.previousTurns,
          roundStartedOld: this.roundStartedOld,
        },
      },
    };
    const updateOptions = {};
    return this.update(updateData, updateOptions);
  }

  async storeRoundData() {
    const roundState = {
      axisCards: this.axis.cards,
      axisDiscards: this.axis.discards,
      allyCards: this.ally.cards,
      allyDiscards: this.ally.discards,
      roundStarted: this.roundStarted,
    };

    const updateData = {
      flags: {
        'deadlands-classic': {
          roundState,
          previousTurns: this.previousTurns,
          roundStartedOld: this.roundStartedOld,
        },
      },
    };
    const updateOptions = {};
    return this.update(updateData, updateOptions);
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

    this.roundStartedOld = true;
    this.roundStarted = false;
    this.offerEndTurn = false;

    this.storeRoundData();

    this.sortCombatants();
  }

  /*
   * Check if there are cards available in the combatant's deck.
   *
   * If no cards are available, collect all discards from combatants allied
   * to this combatant back to the deck.
   *
   * If that doesn't fix the lack of cards, then the function stops
   * trying to allocate one and returns -1 to indicate the failure.
   */

  #tryDraw(deck, isHostile) {
    if (!deck.canDraw) {
      this.reapDiscards(isHostile);
    }

    return deck.canDraw ? deck.draw() : -1;
  }

  // Draw a card from the posse's deck and draw chips in response if necessary
  async #drawPosse(actorId) {
    const card = this.#tryDraw(this.ally, false);

    if (card === CanonicalCards.rJokerIndex) {
      await game['deadlands-classic'].socket.executeAsGM(
        'socketDrawChipActor',
        actorId,
        1,
        true
      );
    } else if (card === CanonicalCards.bJokerIndex) {
      await game['deadlands-classic'].socket.executeAsGM(
        'socketDrawChipMarshal',
        true
      );
    }

    return card;
  }

  // Draw a card from the marshal's deck and draw chips in response if necessary
  async #drawMarshal() {
    const card = this.#tryDraw(this.axis, true);

    if (card === CanonicalCards.bJokerIndex) {
      const chipFromBlack = game.settings.get(
        'deadlands-classic',
        'marshal-black-draw'
      );

      if (chipFromBlack) {
        await game['deadlands-classic'].socket.executeAsGM(
          'socketDrawChipMarshal',
          true
        );
      }
    }

    return card;
  }

  /* The error handling for failing to draw is done here, because -1 will not
   * equal the red joker index or the black joker index. This means that
   * the two draw functions can ignore the error, they will not draw chips
   * in response */

  async draw(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (typeof combatant === 'undefined') return;

    const card = combatant.isHostile
      ? await this.#drawMarshal()
      : await this.#drawPosse(combatant.actorId);

    if (card === -1) {
      const message = `Attempted to draw a card, but none was available.`;

      utility.chatMessage(combatant.actor.name, combatant.actor.name, message);

      return;
    }

    combatant.addCard(card);
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

  /* -------------------------------------------- */
  /*  Event Handlers                              */
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
  async _manageTurnEvents() {
    if (!game.users.activeGM?.isSelf) return;

    if (!this.started) return;

    // Identify what progressed
    const advanceRound = this.current.round > (this.previous?.round ?? -1);

    const advanceTurn = this.current.turn > (this.previous?.turn ?? -1);

    const isInterRound =
      this.roundStartedOld === true && this.roundStarted === false;

    const firstTurn =
      this.roundStartedOld === false && this.roundStarted === true;

    const normalTurn =
      this.roundStartedOld === true && this.roundStarted === true;

    const doInterRound = isInterRound && !this.didInterRound;

    /*
     * Neither round nor turn has advanced. If turn == 0 we are between rounds
     * and should do the round not started logic.
     */

    const nothingToDo = !(advanceTurn || advanceRound || doInterRound);

    this.didInterRound = true;

    if (nothingToDo) return;

    // Conclude prior turn
    if (normalTurn || doInterRound) {
      const prior = this.combatants.get(this.previous?.combatantId);

      if (prior !== undefined) {
        // eslint-disable-next-line no-underscore-dangle
        await this._onEndTurn(prior);
      }
    }

    // Conclude prior round
    if (doInterRound) {
      if (this.previous?.round !== null) {
        // eslint-disable-next-line no-underscore-dangle
        await this._onEndRound();
      }
    }

    // Begin new round
    if (firstTurn) {
      // eslint-disable-next-line no-underscore-dangle
      await this._onStartRound();
    }

    // Begin a new turn
    if (normalTurn && advanceTurn) {
      // eslint-disable-next-line no-underscore-dangle
      await this._onStartTurn(this.combatant);
    }
  }

  /* -------------------------------------------- */

  /* global ui */

  /** @inheritdoc */
  // _onUpdate(data, options, userId)
  // _onCreateDescendantDocuments sends silly adjustedTurn
  // _onUpdateDescendantDocuments
  // _onDeleteDescendantDocuments

  /* -------------------------------------------- */
}
