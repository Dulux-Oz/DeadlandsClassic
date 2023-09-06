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

function makeCards() {
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

  const cards = [];

  const iconDir = 'systems/deadlands-classic/icons/svg/';
  for (let r = 0; r < aCardRank.length; r += 1) {
    for (let s = 0; s < aCardSuit.length; s += 1) {
      const symbol = `${aCardRank[r]}${aCardSuit[s]}`;
      const name = `${rankWord[r]} of ${suitWord[s]}`;
      const file = `${aCardRank[r]}${suitWord[s].charAt(0)}.svg`;
      const icon = `${iconDir}${file}`;
      cards.push({
        symbol,
        name,
        icon,
      });
    }
  }

  // For initiative purposes both jokers are equal, one is index 52 and
  // the other 53, this is arbitrary.

  // Black joker in index 52
  cards.push({
    symbol: 'BJ',
    name: 'The Black Joker',
    icon: `${iconDir}JokerB.svg`,
  });

  // Red joker in index 53
  cards.push({
    symbol: 'RJ',
    name: 'The Red Joker',
    icon: `${iconDir}JokerR.svg`,
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
