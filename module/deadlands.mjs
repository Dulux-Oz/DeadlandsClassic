// import modules
import { DeadlandsCombat } from './documents/dlccombat.mjs';
import { DeadlandsCombatant } from './documents/dlccombatant.mjs';
import { fpPreloadTemplates } from './init/preloads.mjs';
import { fpCreateGameSettings } from './init/settings.mjs';
import { fpRegisterDataModel } from './dlc-data-model.mjs';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

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

  if (!Array.isArray(globalThis.game.deadlands_classic)) {
    game.deadlands_classic = {};
  }

  fpRegisterDataModel();
  fpCreateGameSettings();
  await fpPreloadTemplates();
});

Hooks.once('setup', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Setting Up');
});

Hooks.once('ready', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Readying');
});
