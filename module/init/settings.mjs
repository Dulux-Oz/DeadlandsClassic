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
}
