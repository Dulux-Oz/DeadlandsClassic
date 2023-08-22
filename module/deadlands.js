// import modules
import { DeadlandsCombat } from './dlccombat.js';
import { DeadlandsCombatant } from './dlccombatant.js';

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
