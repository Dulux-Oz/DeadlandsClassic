import { dlcChips } from '../data/chips.mjs';

export function createGameSettings() {
  /* global CanonicalCards */
  game.settings.register('deadlands-classic', 'game-world', {
    name: 'deadlands-classic.settings.game-world.name',
    hint: 'deadlands-classic.settings.game-world.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'WW',
    choices: {
      WW: 'deadlands-classic.game-world.ww',
      HE: 'deadlands-classic.game-world.he',
      LC: 'deadlands-classic.game-world.lc',
    },
  });

  game.settings.register('deadlands-classic', 'deckStyle', {
    name: 'Deck Style',
    hint: 'Classic deadlands or modern cards for initiative,',
    scope: 'client',
    config: true,
    type: String,
    default: 'old',
    choices: {
      old: 'Old School',
      mod: 'Modern',
    },
    onchange: (value) => {
      CanonicalCards.updateIcons();
    },
  });

  game.settings.register('deadlands-classic', 'wildBlack', {
    name: 'Wild black',
    hint: "Marshal's Black joker is wild",
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('deadlands-classic', 'wildRed', {
    name: 'Wild red',
    hint: "Marshal's Red joker is wild",
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('deadlands-classic', 'white-chips', {
    name: 'White Chips',
    hint: 'How many white chips exist in the pot',
    scope: 'world',
    config: true,
    type: Number,
    default: 50,
  });

  game.settings.register('deadlands-classic', 'red-chips', {
    name: 'Red Chips',
    hint: 'How many red chips exist in the pot',
    scope: 'world',
    config: true,
    type: Number,
    default: 25,
  });

  game.settings.register('deadlands-classic', 'blue-chips', {
    name: 'Blue Chips',
    hint: 'How many blue chips exist in the pot',
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
  });

  game.settings.register('deadlands-classic', 'green-chips', {
    name: 'Green Chips',
    hint: 'How many green chips exist',
    scope: 'world',
    config: true,
    type: Number,
    range: { min: 0, max: 20, step: 1 },
    default: 0,
  });

  game.settings.register('deadlands-classic', 'marshall-chips', {
    name: "Marshall's Chips",
    hint: 'Chips held by the Marshall',
    scope: 'world',
    config: false,
    type: dlcChips,
    default: { chips: { white: 0, red: 0, blue: 0 } },
  });
}
