export function fpCreateGameSettings() {
  game.settings.register('deadlands', 'game-world', {
    name: 'deadlands.settings.game-world.name',
    hint: 'deadlands.settings.game-world.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'WW',
    choices: {
      WW: 'deadlands.game-world.ww',
      HE: 'deadlands.game-world.he',
      LC: 'deadlands.game-world.lc',
    },
  });
}
