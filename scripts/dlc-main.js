"use strict";

const SYS_ID = "deadlands-classic";

//Temporary Setting for debugging
CONFIG.debug.hooks = true;

// Remove Comment and activate next line for Production
//  CONFIG.debug.hooks = false;

import { fpRegisterDataModel } from "./dlc-data-model.js";
import { fpCreateGameSettings } from "./dlc-settings.js";

Hooks.once("init",fpOnInit);
Hooks.once("setup",fpOnSetup);
Hooks.once("ready",fpOnReady);

function fpCreateNamespace() {
  if (!Array.isArray(globalThis.game.deadlands_classic)) {
    game.deadlands_classic = {};
  }
  return;
};

function fpOnInit() {
console.log("Deadlands Classic | Initalising");
  fpCreateNamespace();
  fpRegisterDataModel();
  fpCreateGameSettings();
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
