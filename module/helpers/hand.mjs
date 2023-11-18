/* eslint-disable no-console */

export class Hand {
  /* global CanonicalCards */
  constructor(isHostile) {
    this.isHostile = !!isHostile;

    this.cards = [];
    this.discards = [];
    this.rjoker = false;
    this.bjoker = false;
    this.held = -1;
    this.override = -1;
    this.initiative = -1;
  }

  static fromObject(proto) {
    const isHostile = Boolean(proto?.isHostile);

    const hand = new Hand(isHostile);

    if (typeof proto !== 'undefined') {
      if (typeof proto.cards === 'object') {
        hand.cards = Array.from(proto.cards);
      }

      if (typeof proto.discards === 'object') {
        hand.discards = Array.from(proto.discards);
      }

      if (typeof proto.rjoker === 'boolean') {
        hand.rjoker = proto.rjoker;
      }

      if (typeof proto.bjoker === 'boolean') {
        hand.bjoker = proto.bjoker;
      }

      if (typeof proto.held === 'number') {
        hand.held = proto.held;
      }

      if (typeof proto.override === 'number') {
        hand.override = proto.override;
      }

      hand.updateInitiative();
    }

    return hand;
  }

  get contents() {
    const cards = [...this.cards, ...this.discards];

    if (this.rjoker) {
      cards.push(CanonicalCards.rJokerIndex);
    }

    if (this.bjoker) {
      cards.push(CanonicalCards.bJokerIndex);
    }

    if (this.hasSleeved) {
      cards.push(this.held);
    }

    return cards.sort();
  }

  get myCards() {
    return [...this.cards];
  }

  get myDiscards() {
    return [...this.discards];
  }

  /**
   * Whether this "hand" has an unused "normal" card available.
   */
  get hasNormal() {
    return this.cards.length > 0;
  }

  /**
   * Whether this "hand" has a joker card available.
   */
  get hasJoker() {
    return this.rjoker || this.bjoker;
  }

  /**
   * Whether this "hand" has a sleeved card available.
   */
  get hasSleeved() {
    return this.held >= 0;
  }

  /*
   * Whether we are using the sleeved card to set initiative
   */
  get usingSleeved() {
    return this.override !== -1 && this.override === this.held;
  }

  get usingRedJoker() {
    return (
      this.override !== this.held &&
      this.override === CanonicalCards.rJokerIndex
    );
  }

  get usingBlackJoker() {
    return (
      this.override !== this.held &&
      this.override === CanonicalCards.bJokerIndex
    );
  }

  get usingJoker() {
    return this.usingRedJoker || this.usingBlackJoker;
  }

  /**
   *
   * If a sleeved card has been made active, then initiative is 54. If the Marshal's
   * Jokers are not wild, they can be sleeved and if used in this way they get sleeved
   * initiative, not joker initiative.
   *
   * If an unsleeved joker is active, initiative is 55. Player's red joker or Marshal's
   * wild joker.
   *
   * If there is a live card, the highest value is the initiative.
   *
   * Otherwise initiative is -1, i.e. this combatant is no longer participating in
   * this round of combat.
   *
   * It is possible for a sleeved card or joker to be present, which the player
   * has not chosen to activate.
   */
  updateInitiative() {
    // Non-wild jokers can be held
    if (this.override === this.held && this.override > -1) {
      this.initiative = 54;

      // joker is present and active.
    } else if (this.override >= CanonicalCards.smallestJokerIndex) {
      this.initiative = 55;

      // if there is a live card,
    } else {
      this.initiative = this.cards.length > 0 ? this.cards[0] : -1;
    }
  }

  /**
   * If a sleeved card is present, toggle whether it is currently setting the
   * initiative value.
   */
  toggleSleeved() {
    if (this.held > -1) {
      this.override = this.override === this.held ? -1 : this.held;
    }
    this.updateInitiative();
  }

  /**
   * If a red joker is present, toggle whether it is currently setting the
   * initiative value.
   */
  toggleRedJoker() {
    if (this.rjoker) {
      const overridden = this.override === CanonicalCards.rJokerIndex;
      this.override = overridden ? -1 : CanonicalCards.rJokerIndex;
    }
    this.updateInitiative();
  }

  /**
   * If a black joker is present, toggle whether it is currently setting the
   * initiative value.
   */
  toggleBlackJoker() {
    if (this.bjoker) {
      const overridden = this.override === CanonicalCards.bJokerIndex;
      this.override = overridden ? -1 : CanonicalCards.bJokerIndex;
    }
    this.updateInitiative();
  }

  discard(index) {
    if (index <= this.cards.length) {
      const card = this.cards.splice(index, 1);
      this.discards.push(card);
      this.discards.sort((a, b) => b - a);
    }
  }

  undiscard(index) {
    if (index <= this.discards.length) {
      const card = this.discards.splice(index, 1);
      this.add(card);
    }
  }

  /**
   * Add a card to this hand.
   * @param {*} card is an integer representing a card
   * @returns true if the card was valid.
   */
  add(card) {
    if (!CanonicalCards.isCard(card)) {
      return false;
    }

    const intCard = Math.floor(card);

    if (CanonicalCards.isJoker(intCard)) {
      if (this.isHostile) {
        if (intCard === CanonicalCards.rJokerIndex) {
          if (game.settings.get('deadlands-classic', 'wildRed')) {
            this.rjoker = true;
            return true;
          }
        } else if (game.settings.get('deadlands-classic', 'wildBlack')) {
          this.bjoker = true;
          return true;
        }
        this.cards.push(intCard);
        this.cards.sort((a, b) => b - a);
        return true;
      }

      // Non-hostile player got a Red joker
      if (intCard === CanonicalCards.rJokerIndex) {
        this.rjoker = true;
        return true;
      }

      // Non-hostile player got a black joker
      this.discards.push(intCard);
      if (this.held >= 0) {
        this.discards.push(this.held);
        this.held = -1;
      }

      return true;
    }

    this.cards.push(intCard);
    this.cards.sort((a, b) => b - a);

    return true;
  }

  /**
   * Moves the highest active (quick) card to the "up the sleeve" position.
   * This does not work if there are no active cards or if there is already a
   * card up the sleeve.
   * @returns true if a card was moved, false otherwise.
   */
  sleeve() {
    // If there is already a sleeved card or we don't have an active card,
    // then we can't sleeve a card.
    if (this.hasSleeved || !this.hasNormal) {
      return false;
    }

    // Sleeve the largest active card.
    this.held = this.cards.shift();

    this.updateInitiative();

    return true;
  }

  /**
   * Move a card from one of the active locations to the used (discards) pile.
   * This can be used when using a discard to redraw ability, since it
   * doesn't necessarily operate on the highest value card in the quick pile.
   * Only adds the card to the discards pile if it was in the actor's possesion.
   */
  spendAny(card) {
    if (this.override === card) {
      this.override = -1;
    }

    const inx = this.cards.indexOf(card);
    if (inx > -1) {
      this.cards.splice(inx, 1);
    } else if (this.held === card) {
      this.held = -1;
    } else if (card === CanonicalCards.bJokerIndex && this.bjoker) {
      this.bjoker = false;
    } else if (card === CanonicalCards.rJokerIndex && this.rjoker) {
      this.rjoker = false;
    } else {
      // card value is not present
      return false;
    }

    this.discards.push(card);
    this.updateInitiative();
    return true;
  }

  spendActive() {
    if (this.override !== -1) {
      this.spendAny(this.override);
    } else if (this.hasNormal) {
      this.spendAny(this.cards[0]);
    }
  }

  #collectJokers() {
    const cards = [];

    if (this.rjoker) {
      cards.push(CanonicalCards.rJokerIndex);
      this.rjoker = false;
    }

    if (this.bjoker) {
      cards.push(CanonicalCards.bJokerIndex);
      this.bjoker = false;
    }

    return cards;
  }

  #collectHeld() {
    const cards = [];

    if (this.held !== -1) {
      cards.push(this.held);
      this.held = -1;
    }

    return cards;
  }

  // if the deck needs to be shuffled mid round, only discarded cards should
  // be returned to the deck's discard pile.
  collectDiscards() {
    const cards = [...this.discards];
    this.discards = [];
    return cards;
  }

  // At the end of a combat round, discards and jokers should be returned to
  // the deck's discard pile. Held cards are not discarded.
  collectForRoundEnd() {
    const cards = this.collectDiscards();

    cards.push(...this.#collectJokers());

    this.override = -1;

    return cards;
  }

  // To get all of the cards from a combatant, e.g. at the end of a combat
  // (or to change the deck a combatant is using).
  collectAll() {
    // Discard all active cards
    while (this.hasNormal) {
      this.discards.push(this.cards.shift());
    }

    // get discarded cards and jokers
    const cards = this.collectForRoundEnd();

    // add in held if it exists
    cards.push(...this.#collectHeld());

    return cards;
  }
}
