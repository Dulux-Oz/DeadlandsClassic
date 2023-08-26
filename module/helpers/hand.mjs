import { aCards, mCardMap } from './cards.mjs';
import { Deck } from './deck.mjs';

export class Hand {
  constructor(isHostile) {
    this.isHostile = !!isHostile;

    this.live = [];
    this.spent = [];
    this.rjoker = false;
    this.bjoker = false;
    this.held = -1;
    this.override = -1;
    this.initiative = -1;
  }

  static fromObject(proto) {
    const isProto =
      typeof proto.isHostile === 'boolean' &&
      typeof proto.live === 'object' &&
      typeof proto.spent === 'object' &&
      typeof proto.rjoker === 'boolean' &&
      typeof proto.bjoker === 'boolean' &&
      typeof proto.held === 'number' &&
      typeof proto.override === 'number' &&
      typeof proto.initiative === 'number';

    let hand;

    if (isProto) {
      hand = new Hand(proto.isHostile);
      hand.live = proto.live;
      hand.spent = proto.spent;
      hand.rjoker = proto.rjoker;
      hand.bjoker = proto.bjoker;
      hand.held = proto.held;
      hand.override = proto.override;
      hand.initiative = proto.initiative;
    }

    return hand;
  }

  get contents() {
    const cards = [...this.live, ...this.spent];
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

  /**
   * Whether this "hand" has an unused "normal" card available.
   */
  get hasNormal() {
    return this.live.length > 0;
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

  purge(card) {
    if (!Deck.isCard(card)) {
      return false;
    }

    this.spendAny(card);

    const sInx = this.spent.indexOf(card);
    const hadDiscard = sInx > -1;
    if (hadDiscard) {
      this.spent.splice(sInx, 1);
    }

    return hadDiscard;
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
      this.initiative = this.live.length > 0 ? this.live[0] : -1;
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
        this.spent.push(intCard);
        if (this.held >= 0) {
          this.spent.push(this.held);
          this.held = -1;
        }
      }
    } else {
      this.live.push(intCard);
      this.live.sort((a, b) => b - a);
      this.updateInitiative();
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
    this.held = this.live.shift();

    this.updateInitiative();

    return true;
  }

  /**
   * Move a card from one of the active locations to the used (spent) pile.
   * This can be used when using a discard to redraw ability, since it
   * doesn't necessarily operate on the highest value card in the quick pile.
   * Only adds the card to the spent pile if it was in the actor's possesion.
   */
  spendAny(card) {
    if (this.override === card) {
      this.override = -1;
    }

    const inx = this.live.indexOf(card);
    if (inx > -1) {
      this.live.splice(inx, 1);
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

    this.spent.push(card);
    this.updateInitiative();
    return true;
  }

  spendActive() {
    if (this.override !== -1) {
      this.spendAny(this.override);
    } else if (this.hasNormal) {
      this.spendAny(this.live[0]);
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
    const cards = [...this.spent];
    this.spent = [];
    return cards;
  }

  // At the end of a combat round, discards and jokers should be returned to
  // the deck's discard pile. Held cards are not discarded.
  collectForRoundEnd() {
    const cards = this.collectDiscards();

    cards.push(this.#collectJokers());

    this.override = -1;

    return cards;
  }

  // To get all of the cards from a combatant, e.g. at the end of a combat
  // (or to change the deck a combatant is using).
  collectAll() {
    // Discard all active cards
    while (this.hasNormal) {
      this.spent.push(this.live.shift());
    }

    // get discarded cards and jokers
    const cards = this.collectForRoundEnd();

    // add in held if it exists
    cards.push(this.#collectHeld());

    this.override = -1;

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
   * They are separated into quick, spent and held cards; which are separated by | characters
   */

  toField() {
    const fields = [Hand.#makeFieldString(this.live)];
    fields.push(Hand.#makeFieldString(this.spent));

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
      this.live = parts[0].split(',').map((s) => mCardMap.get(s));
    }

    if (parts[1] !== '') {
      this.spent = parts[1].split(',').map((s) => mCardMap.get(s));
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
            this.spent.push(52);
          }
        } else {
          this.held = mCardMap.get(symbol);
        }
      }
    }
    this.updateInitiative();
  }
}
