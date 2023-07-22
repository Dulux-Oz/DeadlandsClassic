<<<<<<< HEAD
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
=======
/*
################################################################################
## Copyright (c) 2023 {{Andrew}}, Andrew Herron, {{Ben}}, Matthew J Black,    ##
##    James Gill & {{James}}.                                                 ##
## This file is part of the *Deadlands Classic* Foundry Virtual Tabletop Game ##
##   System.                                                                  ##
## *Deadlands Classic* is free software: you can redistribute it and/or       ##
##    modify it under the terms of the GNU General Public License as          ##
##    published by the Free Software Foundation, either version 3 of the      ##
##    License, or (at your option) any later version.                         ##
## *Deadlands Classic* is distributed in the hope that it will be useful, but ##
##    WITHOUT ANY WARRANTY; without even the implied warranty of              ##
##    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU        ##
##    General Public License for more details.                                ##
## You should have received a copy of the GNU General Public License along    ##
##    with *Deadlands Classic*. If not, see <https://www.gnu.org/licenses/>.  ##
################################################################################
*/

export function fpCreateGameSettings() {
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
}
>>>>>>> license_update
