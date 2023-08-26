import { Hand } from '../helpers/hand.mjs';

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

  /* -------------------------------------------- */

  /**
   * Get a Roll object which represents the initiative roll for this Combatant.
   */
  // eslint-disable-next-line class-methods-use-this
  getInitiativeRoll(formula) {}

  /* -------------------------------------------- */

  /**
   * Roll initiative for this particular combatant.
   */
  // eslint-disable-next-line no-empty-function, class-methods-use-this
  async rollInitiative(formula) {}

  /* -------------------------------------------- */

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
