/* eslint-disable no-console */
import { aCards, mCardMap } from './cards.mjs';
import { Deck } from './deck.mjs';

export class Hand {
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
      cards.push(53);
    }

    if (this.bjoker) {
      cards.push(52);
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

  get usingJoker() {
    return this.override > 51;
  }

  /**
   * If either joker is active (override value is 52 or 53), initiative is 60.
   * If a sleeved card has been made active (0 <= this.override <= 51), then
   * initiative is 55.
   * If there is a live card, the highest value is the initiative.
   * Otherwise initiative is -1, i.e. this combatant is no longer participating
   * in this round of combat.
   *
   * It is possible for a sleeved card or joker to be present, which the player
   * has not chosen to activate.
   */
  updateInitiative() {
    // joker is present and active.
    if (this.override > 51) {
      this.initiative = 60;
      // sleeved card has been made active
    } else if (this.override > -1) {
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
      this.override = this.override === 53 ? -1 : 53;
    }
    this.updateInitiative();
  }

  /**
   * If a black joker is present, toggle whether it is currently setting the
   * initiative value.
   */
  toggleBlackJoker() {
    if (this.bjoker) {
      this.override = this.override === 52 ? -1 : 52;
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
   * @param {*} card - integer in the range 0 .. 53
   * @returns true if the card was valid.
   */
  add(card) {
    if (!Deck.isCard(card)) {
      return false;
    }

    const intCard = Math.floor(card);

    // The Red joker is always added
    if (intCard === 53 && !this.rjoker) {
      this.rjoker = true;

      // The Black joker
    } else if (intCard === 52) {
      // For a hostile actor, black jokers are just jokers

      if (this.isHostile && !this.bjoker) {
        this.bjoker = true;

        // For an allied actor, black jokers kill themselves and any sleeved
        // card. Black Jokers do not kill Red jokers.
      } else {
        this.discards.push(intCard);
        if (this.held >= 0) {
          this.discards.push(this.held);
          this.held = -1;
        }
      }
    } else {
      this.cards.push(intCard);
      this.cards.sort((a, b) => b - a);
    }

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
    } else if (card === 52 && this.bjoker) {
      this.bjoker = false;
    } else if (card === 53 && this.rjoker) {
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
      cards.push(53);
      this.rjoker = false;
    }

    if (this.bjoker) {
      cards.push(52);
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

  // Turn an array of card integers into a string of comma separated card symbols
  // e.g. [0, 3, 51] -> '2\u2663,2\u2660,A\u2660'
  // 2 of clubs; 2 of spades, ace of spades
  static #makeFieldString(arr) {
    const symbols = arr.map((x) => (x >= 0 && x <= 53 ? aCards[x].symbol : ''));
    return symbols.join(',');
  }

  /**
   * This operation creates a string that represents all the cards held.
   * They are separated into cards, discards and held cards; which are separated by | characters
   */

  toField() {
    const fields = [Hand.#makeFieldString(this.cards)];
    fields.push(Hand.#makeFieldString(this.discards));

    const held = [];

    if (this.rjoker) {
      held.push(53);
    }

    if (this.bjoker) {
      held.push(52);
    }

    if (this.hasSleeved) {
      held.push(this.held);
    }

    fields.push(Hand.#makeFieldString(held));

    return fields.join('|');
  }

  fromField(field) {
    // return this hand to an empty condition. Can throw these away as we're about
    // to populate the data from 'field'.
    this.collectAll();

    const parts = field.split('|');

    if (parts[0] !== '') {
      this.cards = parts[0].split(',').map((s) => mCardMap.get(s));
    }

    if (parts[1] !== '') {
      this.discards = parts[1].split(',').map((s) => mCardMap.get(s));
    }

    if (parts[2] !== '') {
      const held = parts[2].split(',');
      while (held.length > 0) {
        const symbol = held.pop();

        if (symbol === aCards[53].symbol) {
          this.rjoker = true;
        } else if (symbol === aCards[52].symbol) {
          if (this.isHostile) {
            this.bjoker = true;
          } else {
            this.discards.push(52);
          }
        } else {
          this.held = mCardMap.get(symbol);
        }
      }
    }
    this.updateInitiative();
  }
}
