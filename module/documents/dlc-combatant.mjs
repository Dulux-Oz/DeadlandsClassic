import { Hand } from '../helpers/hand.mjs';

export class DeadlandsCombatant extends Combatant {
  constructor(data, context) {
    super(data, context);

    const hasHand =
      typeof this.flags['deadlands-classic'] !== 'undefined' &&
      typeof this.flags['deadlands-classic'].hand !== 'undefined';

    if (hasHand) {
      const flag = this.getFlag('deadlands-classic', 'hand');
      this.hand = Hand.fromObject(flag);
    } else {
      this.hand = new Hand();
    }
  }

  /* Methods that delegate to the embedded hand object */

  get contents() {
    return this.hand.contents;
  }

  get hasNormal() {
    return this.hand.hasNormal;
  }

  get hasBlackJoker() {
    return this.hand.bjoker;
  }

  get hasRedJoker() {
    return this.hand.rjoker;
  }

  get hasSleeved() {
    return this.hand.hasSleeved;
  }

  // Higher numbers are better and go first
  get initiative() {
    return this.hand.initiative;
  }

  // Foundry calls this setter, but we don't care about this value, since we
  // calculate initiative from the cards in the hand. use it to set irrelevant
  // which nothing uses.
  set initiative(foo) {
    this.irrelevant = foo;
  }

  get roundStarted() {
    return this.parent.roundStarted;
  }

  toggleSleeved() {
    this.hand.toggleSleeved();
  }

  toggleRedJoker() {
    this.hand.toggleRedJoker();
  }

  toggleBlackJoker() {
    this.hand.toggleBlackJoker();
  }

  async endTurn() {
    this.hand.spendActive();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleHostility() {
    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;
    const cards = this.hand.collectAll();
    deck.discard(cards);

    this.hand.isHostile = !this.hand.isHostile;
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  /* -------------------------------------------- */

  /**
   * disable the initiative roll for this Combatant.
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
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async cleanUpRound() {
    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;
    deck.discard(this.hand.collectForRoundEnd());
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async cleanUpAll() {
    const deck = this.hand.isHostile ? this.parent.allies : this.parent.axis;
    deck.discard(this.hand.collectAll());
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }
}
