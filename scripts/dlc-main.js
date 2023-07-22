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

// Remove Comment and activate next line for Production
//  CONFIG.debug.hooks = false;

import { fpRegisterDataModel } from './dlc-data-model.js';
import { fpPreloadTemplates } from './dlc-preloads.js';
import { fpCreateGameSettings } from './dlc-settings.js';

// Temporary Setting for debugging
CONFIG.debug.hooks = true;

function fpCreateNamespace() {
  if (!Array.isArray(globalThis.game.deadlands_classic)) {
    game.deadlands_classic = {};
  }
}

async function fpOnInit() {
  console.log('Deadlands Classic | Initalising');
  fpCreateNamespace();
  fpRegisterDataModel();
  fpCreateGameSettings();
  await fpPreloadTemplates();
}

function fpOnReady() {
  console.log('Deadlands Classic | Readying');
}

function fpOnSetup() {
  console.log('Deadlands Classic | Setting Up');
}

Hooks.once('init', await fpOnInit);
Hooks.once('setup', fpOnSetup);
Hooks.once('ready', fpOnReady);
