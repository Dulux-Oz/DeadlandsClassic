// import modules
import { registerDataModel } from './data/dlc-data-model.mjs';
import { DeadlandsCombat } from './documents/dlc-combat.mjs';
import { DeadlandsCombatant } from './documents/dlc-combatant.mjs';
import { CanonicalCards } from './helpers/canonicalcards.mjs';
import { registerSocketFunctions } from './init/socket-functions.mjs';
import { preloadTemplates } from './init/preloads.mjs';
import { createGameSettings } from './init/settings.mjs';
import { registerSheets } from './sheets/dlc-sheets.mjs';
import { DeadlandsActorDirectory } from './sidebar/dlc-actors-directory.mjs';
import { DeadlandsCombatTracker } from './sidebar/dlc-combat-tracker.mjs';
import { DlcSocketManager } from './sockets/dlc-socket-manager.mjs';
import { dlcConfig } from './config.mjs';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

// Socket for socketlib
let socket;

// Remove Comment and activate next line for Production
// CONFIG.debug.hooks = false;
// Temporary Setting for debugging
CONFIG.debug.hooks = true;

/**
 * Init hook.
 */
Hooks.once('init', async () => {
  CONFIG.dlcConfig = dlcConfig;

  // eslint-disable-next-line no-console
  console.log(dlcConfig.Ascii);

  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Initalising');

  // Define custom Document classes
  CONFIG.Combat.documentClass = DeadlandsCombat;
  CONFIG.Combatant.documentClass = DeadlandsCombatant;

  // Define custom ui classes
  CONFIG.ui.combat = DeadlandsCombatTracker;
  CONFIG.ui.actors = DeadlandsActorDirectory;

  /* -------------------------------------------- */

  /* global dlcSocketManager */
  window.dlcSocketManager = new DlcSocketManager();
  socket = dlcSocketManager.registerSystem('deadlands-classic');

  if (!Array.isArray(globalThis.game['deadlands-classic'])) {
    game['deadlands-classic'] = {};
    game['deadlands-classic'].socket = socket;
  }

  registerSocketFunctions(socket);

  /* -------------------------------------------- */

  registerDataModel();
  registerSheets();
  createGameSettings();
  await preloadTemplates();


  globalThis.CanonicalCards = new CanonicalCards();
});

Hooks.once('setup', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Setting Up');
});

Hooks.once('ready', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Readying');
});
