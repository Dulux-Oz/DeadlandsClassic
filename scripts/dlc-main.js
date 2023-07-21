// Temporary Setting for debugging
// Remove Comment and activate next line for Production
//  CONFIG.debug.hooks = false;

import { fpRegisterDataModel } from './dlc-data-model.js';
import { fpPreloadTemplates } from './dlc-preloads.js';
import { fpCreateGameSettings } from './dlc-settings.js';

CONFIG.debug.hooks = true;

function fpCreateNamespace() {
  if (!Array.isArray(game.deadlands_classic)) {
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
