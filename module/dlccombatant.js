import { Hand } from './hand.js';

export class DeadlandsCombatant extends Combatant {
  constructor(data, context) {
    super(data, context);

    if (typeof this.data.flags.deadlands.hand !== 'undefined') {
      this.hand = this.getFlag('deadlands', 'hand');
    } else {
      this.hand = new Hand();
    }
  }

  // Higher numbers are better and go first
  get initiative() {
    return this.hand.initiative;
  }

  /**
   * This converts initiave number (ordered largest first) into a turn
   * effectively 54 - initiave.
   *
   * This value is used for ordering. In standard foundry, where each
   * combatant gets one "turn" per round it is a number in the range 1 ..
   * number of combatants. In the deadlands game it is not a contiguous
   * range, but can be used to determine if the turn has changed, as it
   * is in standard foundry. Numbers will always be in the range 1 .. 54,
   * one means a joker has been played
   */

  get turn() {
    if (this.hand.initiative === 60) {
      return 1;
    }
    if (this.hand.initiative === 55) {
      return 2;
    }
    return 54 - this.hand.initiative;
  }

  async endTurn() {
    this.hand.spendActive();
    await this.setFlag('deadlands', 'hand', this.hand);
  }

  async toggleHostility() {
    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;
    const cards = this.hand.collectAll();
    deck.discard(cards);

    this.hand.isHostile = !this.hand.isHostile;
    await this.setFlag('deadlands', 'hand', this.hand);
  }

  /*
   * Draw @num cards from this combatants deck in the parent.  Default to one
   * card if @num is non-numeric or <= 0.  Checks if there are cards available
   * If no cards are available in this combatants deck, the function collects
   * all the discards from combatants allied to this combatant back to their
   * deck. If that doesn't fix the lack of cards, then the function stops
   * trying to allocate them. */

  async draw(num) {
    let toDraw = typeof num === 'number' && num > 0 ? num : 1;

    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;

    while (toDraw > 0) {
      if (deck.canDraw()) {
        this.hand.add(deck.draw());
        toDraw -= 1;
      } else {
        this.parent.reapDiscards(this.hand.isHostile);
        if (!deck.canDraw()) {
          break;
        }
      }
    }
    await this.setFlag('deadlands', 'hand', this.hand);
  }

  async cleanUpRound() {
    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;
    deck.discard(this.hand.collectForRoundEnd());
    await this.setFlag('deadlands', 'hand', this.hand);
  }

  async cleanUpAll() {
    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;
    deck.discard(this.hand.collectAll());
    await this.setFlag('deadlands', 'hand', this.hand);
  }
}
