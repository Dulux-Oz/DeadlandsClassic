// import modules
import { DeadlandsCombat } from './documents/dlc-combat.mjs';
import { DeadlandsCombatant } from './documents/dlc-combatant.mjs';
import { updateIcons } from './helpers/cards.mjs';
import { fpPreloadTemplates } from './init/preloads.mjs';
import { fpCreateGameSettings } from './init/settings.mjs';
import {
  logCombatant,
  socketDrawCard,
  socketNextTurn,
  socketSleeveHighest,
  socketToggleBlackJoker,
  socketToggleHostility,
  socketToggleRedJoker,
  socketToggleSleeved,
  socketVamoose,
} from './init/socket-functions.mjs';
import { DeadlandsCombatTracker } from './sidebar/dlc-combat-tracker.mjs';
import { fpRegisterDataModel } from './dlc-data-model.mjs';

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
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Initalising');

  // Define custom Document classes
  CONFIG.Combat.documentClass = DeadlandsCombat;
  CONFIG.Combatant.documentClass = DeadlandsCombatant;

  // Define custom ui classes
  CONFIG.ui.combat = DeadlandsCombatTracker;

  if (!Array.isArray(globalThis.game['deadlands-classic'])) {
    game['deadlands-classic'] = {};
    game['deadlands-classic'].socket = socket;
  }

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

Hooks.once('socketlib.ready', () => {
  /* global socketlib */

  // Socket for socketlib
  socket = socketlib.registerSystem('deadlands-classic');
  socket.register('logCombatant', logCombatant);
  socket.register('socketDrawCard', socketDrawCard);
  socket.register('socketNextTurn', socketNextTurn);
  socket.register('socketSleeveHighest', socketSleeveHighest);
  socket.register('socketToggleBlackJoker', socketToggleBlackJoker);
  socket.register('socketToggleHostility', socketToggleHostility);
  socket.register('socketToggleRedJoker', socketToggleRedJoker);
  socket.register('socketToggleSleeved', socketToggleSleeved);
  socket.register('socketVamoose', socketVamoose);
});
