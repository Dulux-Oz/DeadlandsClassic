// import modules
import { CharacterDataModel } from './data/character-data.mjs';
import { CharacterModModel } from './data/character-mod.mjs';
import { GunDataModel } from './data/gun-data.mjs';
import { MeleeDataModel } from './data/melee-data.mjs';
import { MiscItemDataModel } from './data/misc-item-data.mjs';
import { NPCDataModel } from './data/npc-data.mjs';
import { OtherRangedDataModel } from './data/other-ranged-data.mjs';
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
  globalThis.DlcSocketManager = new DlcSocketManager();
  socket = globalThis.DlcSocketManager.registerSystem('deadlands-classic');

  if (!('deadlands-classic' in globalThis.game)) {
    game['deadlands-classic'] = {};
    game['deadlands-classic'].socket = socket;
  }

  registerSocketFunctions(socket);

  /* -------------------------------------------- */
  if (!('chips' in globalThis.game)) {
    game.chips = {};
    game.chips.apps = {};
  }

  CONFIG.Actor.dataModels.character = CharacterDataModel;
  CONFIG.Actor.dataModels.npc = NPCDataModel;
  CONFIG.Item.dataModels.edge = CharacterModModel;
  CONFIG.Item.dataModels.gun = GunDataModel;
  CONFIG.Item.dataModels.hindrance = CharacterModModel;
  CONFIG.Item.dataModels.melee = MeleeDataModel;
  CONFIG.Item.dataModels.miscItem = MiscItemDataModel;
  CONFIG.Item.dataModels.otherRanged = OtherRangedDataModel;

  registerActorSheets();
  createGameSettings();

  globalThis.CanonicalCards = new CanonicalCards();

  await preloadTemplates();
});

Hooks.once('setup', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Setting Up');
  Chips.buildCurrentChipPool();
});

Hooks.once('ready', async () => {
  // eslint-disable-next-line no-console
  console.log('Deadlands Classic | Readying');
});

Hooks.on('renderSidebar', async (app, html) => {
  // add the partyTab
  addChipTab(app, html);
});
