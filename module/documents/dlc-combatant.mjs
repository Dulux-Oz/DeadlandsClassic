import { Hand } from '../helpers/hand.mjs';

/* global CanonicalCards */
export class DeadlandsCombatant extends Combatant {
  // eslint-disable-next-line no-useless-constructor
  constructor(data, context) {
    super(data, context);

    this.hand = new Hand();
  }

  /*
   * Handle all the database jiggery pokery that keeps the various clients in synch.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    const flag = this.getFlag('deadlands-classic', 'hand');

    if (flag !== undefined) {
      this.hand = Hand.fromObject(flag);
    } else {
      this.hand = new Hand();
    }
  }

  /* -------------------------------------------- */

  async addCard(card) {
    this.hand.add(card);
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async cleanUpAll() {
    const cards = this.hand.collectAll();
    await this.setFlag('deadlands-classic', 'hand', this.hand);

    return cards;
  }

  async cleanUpRound() {
    const cards = this.hand.collectForRoundEnd();

    await this.setFlag('deadlands-classic', 'hand', this.hand);

    return cards;
  }

  async discardCard(index) {
    this.hand.discard(index);
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async undiscardCard(index) {
    this.hand.undiscard(index);
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async endTurn() {
    this.hand.spendActive();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async setHand(newHand) {
    this.hand = Hand.fromObject(newHand);
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async sleeveHighest() {
    this.hand.sleeve();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleSleeved() {
    this.hand.toggleSleeved();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleRedJoker() {
    this.hand.toggleRedJoker();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  async toggleBlackJoker() {
    this.hand.toggleBlackJoker();
    await this.setFlag('deadlands-classic', 'hand', this.hand);
  }

  updateInitiative() {
    this.hand.updateInitiative();
  }

  /* Methods that delegate to the embedded hand object */
  get cards() {
    if (this.isDefeated) {
      return [];
    }
    return this.hand.myCards;
  }

  get cardObjects() {
    if (this.isDefeated) {
      return [];
    }
    return this.cards.map((c) => CanonicalCards.cardByIndex(c));
  }

  get contents() {
    return this.hand.contents;
  }

  get discards() {
    return this.hand.myDiscards;
  }

  get discardObjects() {
    return this.discards.map((c) => CanonicalCards.cardByIndex(c));
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

  get initiative() {
    if (this.isDefeated) {
      return -1;
    }
    return this.hand.initiative;
  }

  get isHostile() {
    return this.hand.isHostile;
  }

  get isOverridden() {
    return (
      this.isUsingBlackJoker || this.isUsingRedJoker || this.isUsingSleeved
    );
  }

  get isUsingSleeved() {
    return this.hand.usingSleeved;
  }

  get isUsingRedJoker() {
    return this.hand.usingRedJoker;
  }

  get isUsingBlackJoker() {
    return this.hand.usingBlackJoker;
  }

  get roundStarted() {
    return this.parent.roundStarted;
  }

  get usingSleeved() {
    return this.hand.usingSleeved;
  }

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  // eslint-disable-next-line no-underscore-dangle
  _preCreate(data, options, user) {
    // eslint-disable-next-line no-underscore-dangle, no-undef
    super._preCreate(data, options, user);

    const actor = game.actors.get(data.actorId);

    if (actor.type === 'npc') {
      const hand = new Hand();
      hand.isHostile = true;
      this.updateSource({ 'flags.deadlands-classic.hand': hand });
    }
  }

  /* -------------------------------------------- */

  /**
   * disable the initiative roll for this Combatant.
   */
  // eslint-disable-next-line class-methods-use-this
  getInitiativeRoll(formula) {}

  // Foundry calls this setter, but we don't care about this value, since we
  // calculate initiative from the cards in the hand. use it to set irrelevant
  // which nothing uses.
  // eslint-disable-next-line grouped-accessor-pairs
  set initiative(foo) {
    this.irrelevant = foo;
  }

  /**
   * Roll initiative for this particular combatant.
   */
  // eslint-disable-next-line no-empty-function, class-methods-use-this
  async rollInitiative(formula) {}
}
