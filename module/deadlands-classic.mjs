// import modules
import { CharacterDataModel } from './data/character-data.mjs';
import { ItemData } from './data/item.mjs';
import { NPCDataModel } from './data/npc-data.mjs';
import { TweakData } from './data/tweak.mjs';
import { DeadlandsActor } from './documents/dlc-actor.mjs';
import { DeadlandsCombat } from './documents/dlc-combat.mjs';
import { DeadlandsCombatant } from './documents/dlc-combatant.mjs';
import { CanonicalCards } from './helpers/canonicalcards.mjs';
import { Chips } from './helpers/chips.mjs';
import { addChipTab } from './init/add-chip-tab.mjs';
import { preloadTemplates } from './init/preloads.mjs';
import { registerActorSheets } from './init/register-actor-sheets.mjs';
import { createGameSettings } from './init/settings.mjs';
import { registerSocketFunctions } from './init/socket-functions.mjs';
import { ChipManager } from './sidebar/chip-manager.mjs';
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
  CONFIG.Actor.documentClass = DeadlandsActor;
  CONFIG.Combat.documentClass = DeadlandsCombat;
  CONFIG.Combatant.documentClass = DeadlandsCombatant;

  // Define custom ui classes
  CONFIG.ui.combat = DeadlandsCombatTracker;
  CONFIG.ui.actors = DeadlandsActorDirectory;
  CONFIG.ui.chips = ChipManager;

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

  if (!Array.isArray(globalThis.game.chips)) {
    game.chips = {};
    game.chips.apps = {};
  }

  CONFIG.Actor.dataModels.character = CharacterDataModel;
  CONFIG.Actor.dataModels.npc = NPCDataModel;
  CONFIG.Item.dataModels.edge = TweakData;
  CONFIG.Item.dataModels.hindrance = TweakData;
  CONFIG.Item.dataModels.weapon = ItemData;

  registerActorSheets();
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
  Chips.buildCurrentChipPool();
});

Hooks.on('renderSidebar', async (app, html) => {
  // add the partyTab
  addChipTab(app, html);
});
