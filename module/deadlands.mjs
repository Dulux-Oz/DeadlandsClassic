// import modules
import { DeadlandsCombat } from './documents/dlccombat.mjs';
import { DeadlandsCombatant } from './documents/dlccombatant.mjs';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once('init', async () => {
  // eslint-disable-next-line no-console
  console.log(`Initializing Deadlands System`);

  // Define custom Document classes
  CONFIG.Combat.documentClass = DeadlandsCombat;
  CONFIG.Combatant.documentClass = DeadlandsCombatant;
});
