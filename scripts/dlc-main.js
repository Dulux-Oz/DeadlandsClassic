/*
################################################################################
## Copyright (c) 2023 {{Andrew}}, {{Andy}}, {{Ben}}, Matthew J Black,         ##
##    {{Haxxx}}  & {{James}}.                                                 ##
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

"use strict";

//Temporary Setting for debugging
CONFIG.debug.hooks = true;

// Remove Comment and activate next line for Production
//  CONFIG.debug.hooks = false;

import { fpRegisterDataModel } from "./dlc-data-model.js";
import { fpCreateGameSettings } from "./dlc-settings.js";
import { fpPreloadTemplates } from "./dlc-preloads.js";

Hooks.once("init",await fpOnInit);
Hooks.once("setup",fpOnSetup);
Hooks.once("ready",fpOnReady);

function fpCreateNamespace() {
  if (!Array.isArray(globalThis.game.deadlands_classic)) {
    game.deadlands_classic = {};
  }
  return;
};

async function fpOnInit() {
console.log("Deadlands Classic | Initalising");
  fpCreateNamespace();
  fpRegisterDataModel();
  fpCreateGameSettings();
  await fpPreloadTemplates();
  return;
};

function fpOnReady() {
console.log("Deadlands Classic | Readying");
  return;
}

function fpOnSetup() {
console.log("Deadlands Classic | Setting Up");
  return;
}
