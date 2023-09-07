export const aCardRank = [
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

export const aCardSuit = [
  '\u2663', // 'Clubs',
  '\u2666', // 'Diamonds',
  '\u2665', // 'Hearts',
  '\u2660', // 'Spades',
];

const rankWord = [
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
const suitWord = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];

function makeCards() {
  const cards = [];

  for (let r = 0; r < aCardRank.length; r += 1) {
    for (let s = 0; s < aCardSuit.length; s += 1) {
      const symbol = `${aCardRank[r]}${aCardSuit[s]}`;
      const name = `${rankWord[r]} of ${suitWord[s]}`;
      cards.push({
        symbol,
        name,
      });
    }
  }

  // For initiative purposes both jokers are equal, one is index 52 and
  // the other 53, this is arbitrary.

  // Black joker in index 52
  cards.push({
    symbol: 'BJ',
    name: 'The Black Joker',
  });

  // Red joker in index 53
  cards.push({
    symbol: 'RJ',
    name: 'The Red Joker',
  });

  return cards;
}

export const aCards = makeCards();

// Create a mapping between symbolic name and index
function makeCardMap() {
  const cMap = new Map();

  for (let inx = 0; inx < aCards.length; inx += 1) {
    const card = aCards[inx];
    cMap.set(card.symbol, inx);
  }

  return cMap;
}

export const mCardMap = makeCardMap();

// Takes two card symbol strings and returns a canonical ordering.  If any
// of them is not a valid card, it sorts after everything else. Higher
// priority cards end up in lower positions.

export function compareSymbol(a, b) {
  const left = mCardMap.has(a) ? mCardMap.get(a) : 1;
  const right = mCardMap.has(b) ? mCardMap.get(b) : -1;

  if (left > right) return -1;
  if (left < right) return 1;
  return 0;
}

// eslint-disable-next-line no-underscore-dangle
function _makePath(rank, suit) {
  const deckStyle = game.settings.get('deadlands-classic', 'deckStyle');

  if (deckStyle === 'old') {
    let rankLetter;
    let suitLetter;

    if (rank >= aCardRank.length) {
      rankLetter = 'J';
      suitLetter = suit === 4 ? 'B' : 'R';
    } else {
      rankLetter = aCardRank[rank] === 'T' ? 0 : aCardRank[rank];
      suitLetter = suitWord[suit].charAt(0);
    }

    const file = `Deadlands_Poker_Deck_${suitLetter}${rankLetter}.png`;
    return `systems/deadlands-classic/images/${file}`;
  }

  let file;

  if (rank >= aCardRank.length) {
    file = suit === 4 ? 'JokerB.svg' : 'JokerR.svg';
  } else {
    file = `${aCardRank[rank]}${suitWord[suit].charAt(0)}.svg`;
  }

  return `systems/deadlands-classic/icons/svg/${file}`;
}

export function updateIcons() {
  let index = 0;

  for (let r = 0; r < aCardRank.length; r += 1) {
    for (let s = 0; s < aCardSuit.length; s += 1) {
      const icon = _makePath(r, s);
      aCards[index].icon = icon;
      index += 1;
    }
  }

  aCards[index].icon = _makePath(13, 4);
  index += 1;

  aCards[index].icon = _makePath(13, 5);
}
