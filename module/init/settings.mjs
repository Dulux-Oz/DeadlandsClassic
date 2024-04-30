import { ChipDataModel } from '../data/chip-data.mjs';

export function createGameSettings() {
  /* global CanonicalCards */
  game.settings.register('deadlands-classic', 'game-world', {
    name: 'DLC.settings.game-world.name',
    hint: 'DLC.settings.game-world.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'WW',
    choices: {
      WW: 'DLC.settings.game-world.ww',
      HE: 'DLC.settings.game-world.he',
      LC: 'DLC.settings.game-world.lc',
    },
  });

  game.settings.register('deadlands-classic', 'deckStyle', {
    name: 'DLC.settings.deck-style.name',
    hint: 'DLC.settings.deck-style.hint',
    scope: 'client',
    config: true,
    type: String,
    default: 'old',
    choices: {
      old: 'DLC.settings.deck-style.old',
      mod: 'DLC.settings.deck-style.mod',
    },
    onchange: (value) => {
      CanonicalCards.updateIcons();
    },
  });

  game.settings.register('deadlands-classic', 'wildBlack', {
    name: 'DLC.settings.wild-black.name',
    hint: 'DLC.settings.wild-black.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('deadlands-classic', 'wildRed', {
    name: 'DLC.settings.wild-red.name',
    hint: 'DLC.settings.wild-red.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('deadlands-classic', 'white-chips', {
    name: 'DLC.settings.chips-white.name',
    hint: 'DLC.settings.chips-white.hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 50,
  });

  game.settings.register('deadlands-classic', 'red-chips', {
    name: 'DLC.settings.chips-red.name',
    hint: 'DLC.settings.chips-red.hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 25,
  });

  game.settings.register('deadlands-classic', 'blue-chips', {
    name: 'DLC.settings.chips-blue.name',
    hint: 'DLC.settings.chips-blue.hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
  });

  game.settings.register('deadlands-classic', 'green-chips', {
    name: 'DLC.settings.chips-green.name',
    hint: 'DLC.settings.chips-green.hint',
    scope: 'world',
    config: true,
    type: Number,
    range: { min: 0, max: 20, step: 1 },
    default: 0,
  });

  game.settings.register('deadlands-classic', 'marshall-chips', {
    name: 'DLC.settings.chips-marshal.name',
    hint: 'DLC.settings.chips-marshal.hint',
    scope: 'world',
    config: false,
    type: ChipDataModel,
    default: { chips: { white: 0, red: 0, blue: 0 } },
  });
}
