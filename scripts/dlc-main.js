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
