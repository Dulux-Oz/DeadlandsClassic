<<<<<<< HEAD
"use strict";

"use strict";

export class cCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions,{
      classes: [
        "dlc",
        "sheet",
        "actor"],
      template: "systems/deadlands-classic/templates/dlc-character-sheet.html",
      width: 660,
      height: 800,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "main"
      }],
    });
  }
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

export class cCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template: 'systems/deadlands-classic/templates/dlc-character-sheet.html',
      width: 660,
      height: 800,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'main',
        },
      ],
    });
  }
}
>>>>>>> license_update
