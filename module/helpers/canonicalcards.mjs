/* eslint-disable class-methods-use-this */
export class CanonicalCards {
  constructor() {
    this.rank = [
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'T',
      'J',
      'Q',
      'K',
      'A',
    ];

    this.suit = [
      '\u2663', // 'Clubs',
      '\u2666', // 'Diamonds',
      '\u2665', // 'Hearts',
      '\u2660', // 'Spades',
    ];

    this.word = [
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Jack',
      'Queen',
      'King',
      'Ace',
    ];

    this.suitWord = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];

    this.cards = this.makeCards();

    this.cardMap = this.makeCardMap();

    this.updateIcons();
  }

  // For initiative purposes the jokers are in the indices immediately following
  // the normal cards. Which joker gets which index is arbitrary. However, they
  // are used as initiative values in the GMs deck, and the black joker has the
  // highest value.

  get bJokerIndex() {
    return 53;
  }

  get rJokerIndex() {
    return 52;
  }

  get largestJokerIndex() {
    return Math.max(this.bJokerIndex, this.rJokerIndex);
  }

  get smallestJokerIndex() {
    return Math.min(this.bJokerIndex, this.rJokerIndex);
  }

  isJoker(index) {
    const num = Number(index);
    return num === this.rJokerIndex || num === this.bJokerIndex;
  }

  cardByIndex(index) {
    return this.cards[index];
  }

  cardBySymbol(symbol) {
    const index = this.cardMap.get(symbol);
    return this.cardByIndex(index);
  }

  // Does this integer represent a card in this deck
  isCard(card) {
    if (Number.isNaN(card)) {
      return false;
    }

    const intCard = Math.floor(card);

    return intCard >= 0 && intCard <= this.largestJokerIndex;
  }

  makeCards() {
    const cards = [];
    let index = 0;
    let die = 4;

    for (let r = 0; r < this.rank.length; r += 1) {
      if (r === 1 || r === 6 || r === 10 || r === 12) {
        die += 2;
      }

      for (let s = 0; s < this.suit.length; s += 1) {
        const dieNum = s + 1;
        const symbol = `${this.rank[r]}${this.suit[s]}`;
        const name = `${this.word[r]} of ${this.suitWord[s]}`;
        cards.push({
          symbol,
          name,
          index,
          die,
          dieNum,
        });
        index += 1;
      }
    }

    const bJoker = {
      symbol: 'BJ',
      name: 'The Black Joker',
      index: this.bJokerIndex,
      die: 12,
      dieNum: 5,
    };

    const rJoker = {
      symbol: 'RJ',
      name: 'The Red Joker',
      index: this.rJokerIndex,
      die: 12,
      dieNum: 5,
    };

    if (this.rJokerIndex === this.smallestJokerIndex) {
      cards.push(rJoker);
      cards.push(bJoker);
    } else {
      cards.push(bJoker);
      cards.push(rJoker);
    }

    return cards;
  }

  // Create a mapping between symbolic name and index
  makeCardMap() {
    const cMap = new Map();

    for (let inx = 0; inx < this.cards.length; inx += 1) {
      const card = this.cards[inx];
      cMap.set(card.symbol, inx);
    }

    return cMap;
  }

  // Takes two card symbol strings and returns a canonical ordering.  If any
  // of them is not a valid card, it sorts after everything else. Higher
  // priority cards end up in lower positions.

  compareSymbol(a, b) {
    const left = this.cardMap.has(a) ? this.cardMap.get(a) : 1;
    const right = this.cardMap.has(b) ? this.cardMap.get(b) : -1;

    if (left > right) return -1;
    if (left < right) return 1;
    return 0;
  }

  #getMakePath() {
    const deckStyle = game.settings.get('deadlands-classic', 'deckStyle');
    if (deckStyle === 'old') {
      return function oldMakePath(rank, suit) {
        let rankLetter;
        let suitLetter;

        if (rank >= this.rank.length) {
          rankLetter = 'J';
          suitLetter = suit === 4 ? 'R' : 'B';
        } else {
          rankLetter = this.rank[rank] === 'T' ? 0 : this.rank[rank];
          suitLetter = this.suitWord[suit].charAt(0);
        }

        const file = `Deadlands_Poker_Deck_${suitLetter}${rankLetter}.png`;
        return `systems/deadlands-classic/images/${file}`;
      };
    }

    return function newMakePath(rank, suit) {
      if (rank >= this.rank.length) {
        const file = suit === 4 ? 'JokerR.svg' : 'JokerB.svg';
        return `systems/deadlands-classic/icons/svg/${file}`;
      }

      const rL = this.rank[rank];
      const sL = this.suitWord[suit].charAt(0);

      return `systems/deadlands-classic/icons/svg/${rL}${sL}.svg`;
    };
  }

  updateIcons() {
    const makePath = this.#getMakePath();

    let index = 0;

    for (let r = 0; r < this.rank.length; r += 1) {
      for (let s = 0; s < this.suit.length; s += 1) {
        const icon = makePath.call(this, r, s);
        this.cards[index].icon = icon;
        index += 1;
      }
    }

    this.cards[index].icon = makePath.call(this, 13, 4);
    index += 1;

    this.cards[index].icon = makePath.call(this, 13, 5);
  }
}
