import { aCards } from '../helpers/cards.mjs';
import { Hand } from '../helpers/hand.mjs';

export class DeadlandsCombatant extends Combatant {
  // eslint-disable-next-line no-useless-constructor
  constructor(data, context) {
    super(data, context);
  }

  /*
   * Handle all the database jiggery pokery that keeps the various clients in synch.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

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

  async setHand(newHand) {
    this.hand = Hand.fromObject(newHand);
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async sleeveHighest() {
    this.hand.sleeve();
    this.parent.updateCombatData();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleSleeved() {
    this.hand.toggleSleeved();
    this.parent.updateCombatData();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleRedJoker() {
    this.hand.toggleRedJoker();
    this.parent.updateCombatData();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleBlackJoker() {
    this.hand.toggleBlackJoker();
    this.parent.updateCombatData();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  /* Methods that delegate to the embedded hand object */
  get cards() {
    return this.hand.cards;
  }

  get cardObjects() {
    return this.cards.map((c) => aCards[c]);
  }

  get contents() {
    return this.hand.contents;
  }

  get discards() {
    return this.hand.discards;
  }

  get discardObjects() {
    return this.discards.map((c) => aCards[c]);
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

  get isHostile() {
    return this.hand.isHostile;
  }

  get isOverridden() {
    return this.hand.usingJoker || this.hand.usingSleeved;
  }

  get isUsingJoker() {
    return this.hand.usingJoker;
  }

  get roundStarted() {
    return this.parent.roundStarted;
  }

  get usingSleeved() {
    return this.hand.usingSleeved;
  }

  updateInitiative() {
    this.hand.updateInitiative();
  }

  async endTurn() {
    this.hand.spendActive();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  // The combat calls endTurn for us
  async vamoose() {
    this.parent.vamoose(this);
  }

  async toggleHostility() {
    const deck = this.isHostile ? this.parent.axis : this.parent.allies;
    const cards = this.hand.collectAll();
    deck.discard(cards);
    this.parent.storeRoundData();

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

    const deck = this.isHostile ? this.parent.axis : this.parent.allies;
    while (toDraw > 0) {
      if (deck.canDraw) {
        this.hand.add(deck.draw());
        toDraw -= 1;
      } else {
        this.parent.reapDiscards(this.isHostile);
        if (!deck.canDraw) {
          break;
        }
      }
    }
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async cleanUpRound() {
    const cards = this.hand.collectForRoundEnd();

    await this.setFlag('deadlands-classic', 'hand', this.hand);

    return cards;
  }

  async cleanUpAll() {
    const deck = this.isHostile ? this.parent.axis : this.parent.allies;
    deck.discard(this.hand.collectAll());
    this.parent.storeRoundData();

    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }
}
