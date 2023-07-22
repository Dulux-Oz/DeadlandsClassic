"use strict";

export function fpCreateGameSettings() {
  game.settings.register("deadlands-classic", "game-world", {
    name: "deadlands-classic.settings.game-world.name",
    hint: "deadlands-classic.settings.game-world.hint",
    scope: "world",
    config: true,
    type: String,
    default: "WW",
    choices: {
      "WW": "deadlands-classic.game-world.ww",
      "HE": "deadlands-classic.game-world.he",
      "LC": "deadlands-classic.game-world.lc"
    }
  });
}
