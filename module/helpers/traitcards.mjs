// import { CanonicalCards } from './canonicalcards.mjs';
import { Deck } from './deck.mjs';

/* global CanonicalCards */

export class TraitCards {
  #cards;

  #numJokers;

  #numTwos;

  #order;

  constructor() {
    this.#cards = [];
    this.#numJokers = 0;
    this.#numTwos = 0;
    this.#order = [];
  }

  static fromString(cardString) {
    const obj = new TraitCards();

    const [jString, tString, nString] = cardString.split('|');
    const jokers = jString.split(',').filter((e) => e !== '');
    const twos = tString.split(',').filter((e) => e !== '');
    const normal = nString.split(',').filter((e) => e !== '');

    obj.#numJokers = jokers.length;
    obj.#numTwos = twos.length;

    jokers.forEach((item) => {
      const [sym, num] = item.split('-').filter((e) => e !== '');
      // global CanonicalCards
      const cannon = CanonicalCards.cardBySymbol(sym);
      const card = { ...cannon };
      card.dieNum = num;
      obj.#cards.push(card);
    });

    twos.forEach((sym) => {
      const cannon = CanonicalCards.cardBySymbol(sym);
      const card = { ...cannon };
      obj.#cards.push(card);
    });

    normal.forEach((sym) => {
      const cannon = CanonicalCards.cardBySymbol(sym);
      const card = { ...cannon };
      obj.#cards.push(card);
    });

    let jIndex = 0;
    let nIndex = 0;
    let tIndex = 0;

    while (jIndex < obj.#numJokers) {
      if (normal[nIndex].die === 12) {
        if (jokers[jIndex]?.dieNum >= normal[nIndex]?.dieNum) {
          obj.#order.push(jIndex);
          jIndex += 1;
        } else {
          obj.#order.push(obj.mandatory + nIndex);
          nIndex += 1;
        }
      } else {
        obj.#order.push(jIndex);
        jIndex += 1;
      }
    }

    while (obj.#order?.length < 10 - obj.#numTwos) {
      obj.#order.push(obj.mandatory + nIndex);
      nIndex += 1;
    }

    while (tIndex < obj.#numTwos) {
      obj.#order.push(obj.#numJokers + tIndex);
      tIndex += 1;
    }

    while (obj.#order?.length < 12) {
      obj.#order.push(obj.mandatory + nIndex);
      nIndex += 1;
    }

    return obj;
  }

  /* -------------------------------------------- */

  /* Draw the set of cards that will be used to generate a character's traits.
   * Return them as a string with 3 fields, separated by |. Each field is
   * separated by ,
   *
   * The first field is the jokers drawn, if any. If a joker has been drawn,
   * another card is drawn to determine its number of dice, it will appear as
   * the joker and number of dice separated by a hyphen (e.g. RJ-2). These
   * will be sorted by higest number of dice first, (e.g. BJ-3,RJ-2).
   *
   * The second field contains any twos drawn, sorted by number of dice. These
   * will be sorted by higest number of dice first, (e.g. 2S,2D).
   *
   * The last frield is a comma separated field of normal cards, sorted by die
   * size and then by number of dice within each die size.
   *
   *    e.g.
   *                    AS,   QS,   KH,   KC,   9S,  JH,  9D,  JC,  3S,  7H
   *     representing   4d12, 4d10, 3d10, 1d10, 4d8, 3d8, 2d8, 1d8, 4d6, 3d6
   */

  static makeNewCardString() {
    const deck = new Deck();

    const jokers = [];
    const twos = [];
    const normal = [];

    for (let i = 0; i < 12; i += 1) {
      const card = CanonicalCards.cardByIndex(deck.draw());

      if (CanonicalCards.isJoker(card.index)) {
        const suitCard = CanonicalCards.cardByIndex(deck.draw());
        jokers.push(`${card.symbol}-${suitCard.dieNum}`);
      } else if (card.index <= 3) {
        twos.push(card.symbol);
      } else {
        normal.push(card.symbol);
      }
    }

    jokers.sort((a, b) => {
      const numA = a.split('-')[1];
      const numB = b.split('-')[1];
      return numB - numA;
    });

    twos.sort((a, b) => {
      const cardA = CanonicalCards.cardBySymbol(a);
      const cardB = CanonicalCards.cardBySymbol(b);
      return cardB.dieNum - cardA.dieNum;
    });

    normal.sort((a, b) => {
      const cardA = CanonicalCards.cardBySymbol(a);
      const cardB = CanonicalCards.cardBySymbol(b);
      return cardA.die - cardB.die === 0
        ? cardB.dieNum - cardA.dieNum
        : cardB.die - cardA.die;
    });

    const regions = [jokers.join(','), twos.join(','), normal.join(',')];

    return regions.join('|');
  }

  get mandatory() {
    return this.#numJokers + this.#numTwos;
  }

  static #boundRank(rank) {
    if (rank < 1) {
      return 0;
    }
    if (rank > 10) {
      return 11;
    }
    return rank;
  }

  /* Convert the Rank number 0..11, where rank 0 contains the best trait die,
     to an index (0 .. 11) into the cards drawn.

     Rank zero contains the highest ranked card. All mandatory cards are 
     sorted into the first ten ranks (0..9). If there are any twos 
     present, they turn up in the lowest ranked positions of the ten
     (highest numbers). */

  rankToIndex(rank) {
    const boundRank = TraitCards.#boundRank(rank);
    return this.#order?.[boundRank];
  }

  /* An index 0..11 of the cards drawn for this set of traits.
     the first 0..(this.mandatory - 1) cards must be used. This ordering
     does not give the cards in descending order of rank, since
     the twos follow the jokers. */
  cardByIndex(index) {
    return this.#cards?.[index];
  }

  get cards() {
    const cards = [];
    const cardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    cardIndices.forEach((inx) => {
      const card = this.cardByIndex(inx);
      const { die, dieNum, icon, name, symbol } = card;
      cards[inx] = {
        die,
        dieNum,
        icon,
        index: inx,
        name,
        symbol,
      };
    });

    return cards;
  }
}
