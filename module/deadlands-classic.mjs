// import modules
import { DeadlandsCombat } from './documents/dlc-combat.mjs';
import { DeadlandsCombatant } from './documents/dlc-combatant.mjs';
import { updateIcons } from './helpers/cards.mjs';
import { fpPreloadTemplates } from './init/preloads.mjs';
import { fpCreateGameSettings } from './init/settings.mjs';
import { registerSocketFunctions } from './init/socket-functions.mjs';
import { fpRegisterDataModel } from './sheets/dlc-data-model.mjs';
import { DeadlandsCombatTracker } from './sidebar/dlc-combat-tracker.mjs';
import { DlcSocketManager } from './sockets/dlc-socket-manager.mjs';
import { DlcConfig } from './config.mjs';

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
  CONFIG.DlcConfig = DlcConfig;

  // eslint-disable-next-line no-console
  console.log(DlcConfig.Ascii);

  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Initalising');

  // Define custom Document classes
  CONFIG.Combat.documentClass = DeadlandsCombat;
  CONFIG.Combatant.documentClass = DeadlandsCombatant;

  // Define custom ui classes
  CONFIG.ui.combat = DeadlandsCombatTracker;

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

  fpRegisterDataModel();
  fpCreateGameSettings();
  await fpPreloadTemplates();

  updateIcons();
});

Hooks.once('setup', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Setting Up');
});

Hooks.once('ready', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Readying');
});
